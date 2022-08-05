variable "ENV" {}
variable "NAME" {}
variable "ECS_ARN" {}
variable "ECS_TASK_ARN" {}
variable "TEMPLATE_FILE" {}
variable "TYPE" {
  default = "STANDARD"
}


variable "CUSTOM_POLICIES" {
  default = []
}

variable "AWS_POLICIES" {
  default = []
}

variable "TAGS" {

}

data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["states.amazonaws.com"]
    }
  }
}

module "role" {
  source             = "../../role"
  NAME               = "${var.ENV}-tenant-provision-step-function"
  CUSTOM_POLICIES    = var.CUSTOM_POLICIES
  AWS_POLICIES       = var.AWS_POLICIES
  ASSUME_ROLE_POLICY = data.aws_iam_policy_document.assume_role_policy.json
  TAGS               = var.TAGS
}

resource "aws_sfn_state_machine" "sfn_state_machine" {
  name     = var.NAME
  role_arn = module.role.arn
  type     = var.TYPE

  definition = templatefile(
    format("%s/%s", "../../modules/application/step_function/template", var.TEMPLATE_FILE),
    {}
  )
}

output "arn" {
  value = aws_sfn_state_machine.sfn_state_machine.arn
}
