variable "AWS_REGION" {
  default = "ap-southeast-1"
}

variable "DEV_SCM_CONSTANT_ARN" {
  default = "arn:aws:secretsmanager:ap-southeast-1:087112488386:secret:dev-infrastructure-constant-91TPFe"
}

variable "PROD_SCM_CONSTANT_ARN" {
  default = "arn:aws:secretsmanager:ap-southeast-1:800823848420:secret:prod-infrastructure-constant-FEt8TM"
}
