variable "LAMBDA_TRIGGERS" {}
variable "LAMBDA_ARNS" {}
variable "COGNITO_USER_POOL_ID" {}
variable "ENV" {}
variable "FEATURE_NAME" {}
variable "AWS_REGION" {}

variable "ADMIN_CREATE_USER_CONFIG" {
  type    = any
  default = <<EOF
'{"InviteMessageTemplate": {"EmailSubject": "Kích hoạt tài khoản thành công","EmailMessage": "<p>Chúc mừng bạn! Hệ thống đã kích hoạt thành công tài khoản TravelOffice</p><p>Username: <strong>{username}</strong></p><p>Password: <strong>{####}</strong></p>"}}'
EOF
}

variable "EMAIL_VERIFICATION_SUBJECT" {
  default = "Đổi\\ mật\\ khẩu\\ tài\\ khoản\\ TravelOffice"
}

variable "EMAIL_VERIFICATION_MESSAGE" {
  default = "\\<p\\>Mã\\ xác\\ thực\\ của\\ bạn\\ là:\\ \\<strong\\>{####}\\<\\/strong\\>\\<\\/\\>"
}

data "aws_caller_identity" "current" {}

resource "null_resource" "cognito_trigger_lambda" {
  for_each = var.LAMBDA_TRIGGERS
  triggers = {
    always_run = "${timestamp()}"
  }
  provisioner "local-exec" {
    command = "aws cognito-idp update-user-pool --user-pool-id ${var.COGNITO_USER_POOL_ID} --lambda-config ${each.key}=${var.LAMBDA_ARNS[each.value.lambda_name]} --admin-create-user-config=${chomp(replace(var.ADMIN_CREATE_USER_CONFIG, "\r\n", "\n"))} --email-verification-subject=${var.EMAIL_VERIFICATION_SUBJECT} --email-verification-message=${var.EMAIL_VERIFICATION_MESSAGE}"
  }
}

resource "aws_lambda_permission" "api_gatewway_invoke_lambda_permission" {
  for_each      = var.LAMBDA_TRIGGERS
  statement_id  = "${var.ENV}-${var.FEATURE_NAME}-${each.value.lambda_name}-${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = "${var.ENV}-${var.FEATURE_NAME}-${each.value.lambda_name}"
  principal     = "cognito-idp.amazonaws.com"

  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "arn:aws:cognito-idp:${var.AWS_REGION}:${data.aws_caller_identity.current.account_id}:userpool/${var.COGNITO_USER_POOL_ID}"
}
