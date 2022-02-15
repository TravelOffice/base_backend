variable "BASE_BACKEND_PUBLIC_SUBNETS" {}

variable "BASE_BACKEND_VPC_ID" {}
variable "LAMBDA_LAYERS" {}
variable "LAMBDA_FUNCTIONS" {}
variable "API_ENDPOINTS" {}
variable "AWS_REGION" {}
variable "STANDARD_LAMBDA_IAM_ROLE" {}
variable "EXECUTE_ECS_TASK_LAMBDA_ROLE" {}
variable "PROVISION_TENANT_INFA_ECS_TASK_ROLE" {}
variable "LAMBDA_TRIGGERS" {}
variable "LAMBDA_CRONS" {}
locals {
  iam_roles = {
    standard_lambda_role                 = var.STANDARD_LAMBDA_IAM_ROLE
    execute_ecs_task_lambda_role         = var.EXECUTE_ECS_TASK_LAMBDA_ROLE
    provision_tenant_infra_ecs_task_role = var.PROVISION_TENANT_INFA_ECS_TASK_ROLE
  }
  env_vars = {
    ecs_task_vars = {
      ENV                      = var.ENV
      ECS_CLUSTER_NAME         = module.ECS.name
      ECS_LAUNCH_TYPE          = "FARGATE"
      ECS_SUBNET               = var.BASE_BACKEND_PUBLIC_SUBNETS[0]
      ECS_TASK_DEFINITION_ARN  = module.ECS.task_definition_arn
      ECS_TASK_DEFINITION_NAME = module.ECS.task_definition_name
    }
  }

  tags = {
    Env       = var.ENV
    Terraform = true
    Feature   = var.FEATURE_NAME
  }
}

module "LAMBDA_LAYER" {
  source        = "../../modules/application/lambda_layer"
  LAMBDA_LAYERS = var.LAMBDA_LAYERS
  ENV           = var.ENV
  FEATURE_NAME  = var.FEATURE_NAME
  TAGS          = local.tags
}

module "LAMBDA_FUNCTION" {
  source            = "../../modules/application/lambda"
  LAMBDA_FUNCTIONS  = var.LAMBDA_FUNCTIONS
  LAMBDA_LAYER_ARNS = module.LAMBDA_LAYER.lambda_layer_arns
  VPC_ID            = var.BASE_BACKEND_VPC_ID
  SUBNETS           = var.BASE_BACKEND_PUBLIC_SUBNETS
  ENV               = var.ENV
  FEATURE_NAME      = var.FEATURE_NAME
  IAM_ROLES         = local.iam_roles
  ENV_VARS          = local.env_vars
  TAGS              = local.tags
}

module "API_GATEWAY" {
  source                 = "../../modules/application/apigateway"
  LAMBDA_ARNS            = module.LAMBDA_FUNCTION.lambda_arns
  API_ENDPOINTS          = var.API_ENDPOINTS
  AWS_REGION             = var.AWS_REGION
  FEATURE_NAME           = var.FEATURE_NAME
  DOMAIN_NAME            = var.DOMAIN_NAME
  HOSTED_ZONE_ID         = var.HOSTED_ZONE_ID
  DOMAIN_CERTIFICATE_ARN = var.DOMAIN_CERTIFICATE_ARN
  ENV                    = var.ENV
  TAGS                   = local.tags

}

module "LAMBDA_CRON" {
  source       = "../../modules/event/lambda_cron"
  FEATURE_NAME = var.FEATURE_NAME
  LAMBDA_CRONS = var.LAMBDA_CRONS
  LAMBDA_ARNS  = module.LAMBDA_FUNCTION.lambda_arns
  ENV          = var.ENV
  TAGS         = local.tags
}


module "ECS" {
  source        = "../../modules/application/ecs"
  FEATURE_NAME  = var.FEATURE_NAME
  ENV           = var.ENV
  ECS_TASK_ROLE = local.iam_roles.provision_tenant_infra_ecs_task_role
  TAGS          = local.tags
}

module "ecs_vpc_endpoint" {
  source       = "../../modules/network/vpc/endpoint"
  SERVICE_NAME = "com.amazonaws.${var.AWS_REGION}.ecs"
  FEATURE_NAME = var.FEATURE_NAME
  ENV          = var.ENV
  VPC_ID       = var.BASE_BACKEND_VPC_ID
  TAGS         = local.tags
}