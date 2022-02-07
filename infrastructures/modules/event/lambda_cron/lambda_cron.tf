variable "LAMBDA_CRONS" {}
variable "LAMBDA_ARNS" {}
variable "FEATURE_NAME" {}
variable "ENV" {}
variable "TAGS" {}

module "eventbridge" {
  source = "terraform-aws-modules/eventbridge/aws"

  for_each   = var.LAMBDA_CRONS
  create_bus = false

  rules = {
    crons = {
      name                = "${var.ENV}-${var.FEATURE_NAME}-${each.key}"
      description         = "Trigger for a Lambda ${each.value.lambda_name}"
      schedule_expression = "${each.value.schedule_expression}"
    }
  }

  targets = {
    crons = [
      {
        name  = "${var.ENV}-${var.FEATURE_NAME}-${each.key}"
        arn   = "${var.LAMBDA_ARNS[each.value.lambda_name]}"
        input = jsonencode({ "job" : "cron-by-rate" })
      }
    ]
  }

  tags = var.TAGS
}
