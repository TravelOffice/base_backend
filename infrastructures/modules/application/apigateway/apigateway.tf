variable "ENV" {}
variable "LAMBDA_ARNS" {}
variable "API_ENDPOINTS" {}
variable "AWS_REGION" {}
variable "FEATURE_NAME" {}
variable "DOMAIN_NAME" {}
variable "HOSTED_ZONE_ID" {}
variable "DOMAIN_CERTIFICATE_ARN" {}
variable "TAGS" {}

# Get current aws account information
data "aws_caller_identity" "current" {}

resource "aws_api_gateway_rest_api" "rest_api" {
  body = jsonencode({
    openapi = "3.0.1"
    info = {
      title   = "${var.ENV}-${var.FEATURE_NAME}"
      version = "1.0"
    }
    paths = {
      for pathKey, pathValue in var.API_ENDPOINTS : pathKey => {
        for methodKey, methodValue in pathValue : lower(methodKey) => {
          x-amazon-apigateway-integration = {
            httpMethod           = "POST"
            payloadFormatVersion = "1.0"
            type                 = "AWS_PROXY"
            uri                  = "arn:aws:apigateway:${var.AWS_REGION}:lambda:path/2015-03-31/functions/${var.LAMBDA_ARNS[methodValue.lambda_name]}/invocations"
          }
        }
      }
    }
  })

  name = lower("${var.ENV}-${var.FEATURE_NAME}")

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = var.TAGS
}

resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id

  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.rest_api.body))
  }

  lifecycle {
    create_before_destroy = true
  }
}

locals {
  mapping_method_lambda_name = flatten([
    for path in keys(var.API_ENDPOINTS) : [
      for key, value in var.API_ENDPOINTS[path] : {
        path        = path
        method      = key
        lambda_name = value.lambda_name
      }
    ]
  ])
}

resource "aws_lambda_permission" "api_gatewway_invoke_lambda_permission" {
  for_each      = { for api in local.mapping_method_lambda_name : lower("${api.path}_${api.method}") => api }
  statement_id  = "${var.ENV}-${var.FEATURE_NAME}-${each.value.lambda_name}-${each.value.method}-AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = "${var.ENV}-${var.FEATURE_NAME}-${each.value.lambda_name}"
  principal     = "apigateway.amazonaws.com"

  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "arn:aws:execute-api:${var.AWS_REGION}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.rest_api.id}/*/${each.value.method}${each.value.path}"
}

resource "aws_api_gateway_stage" "api_gateway_stage" {
  deployment_id = aws_api_gateway_deployment.deployment.id
  rest_api_id   = aws_api_gateway_rest_api.rest_api.id
  stage_name    = var.ENV
  tags          = var.TAGS
}

resource "aws_api_gateway_domain_name" "domain_name" {
  domain_name              = lower("${var.ENV}-${var.FEATURE_NAME}.${var.DOMAIN_NAME}")
  regional_certificate_arn = var.DOMAIN_CERTIFICATE_ARN

  endpoint_configuration {
    types = ["REGIONAL"]
  }
  tags = var.TAGS
}

# DNS record using Route53.
# Route53 is not specifically required; any DNS host can be used.
resource "aws_route53_record" "route53_record" {
  name    = aws_api_gateway_domain_name.domain_name.domain_name
  type    = "A"
  zone_id = var.HOSTED_ZONE_ID

  alias {
    evaluate_target_health = true
    name                   = aws_api_gateway_domain_name.domain_name.regional_domain_name
    zone_id                = aws_api_gateway_domain_name.domain_name.regional_zone_id
  }
}

resource "aws_api_gateway_base_path_mapping" "path_mapping" {
  api_id      = aws_api_gateway_rest_api.rest_api.id
  stage_name  = aws_api_gateway_stage.api_gateway_stage.stage_name
  domain_name = aws_api_gateway_domain_name.domain_name.domain_name
}