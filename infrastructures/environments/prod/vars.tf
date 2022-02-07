variable "ENV" {
  default = "prod"
}

variable "BRANCH_NAME" {
  default = "master"
}
variable "VPC_CIDR" {
  default = "10.10.0.0/24"
}

variable "PUBLIC_SUBNETS_CIDR" {
  default = ["10.10.0.0/28", "10.10.0.32/28"]
}

variable "PRIVATE_SUBNETS_CIDR" {
  default = ["10.10.0.64/28", "10.10.0.96/28"]
}

variable "DATABASE_SUBNETS_CIDR" {
  default = ["10.10.0.128/28", "10.10.0.160/28"]
}

variable "CODESTAR_CONNECTOR_CREDENTIALS" {
  default = "arn:aws:codestar-connections:ap-southeast-1:249593777629:connection/f7623ad7-387d-4abc-ae08-7b83cd464851"
}