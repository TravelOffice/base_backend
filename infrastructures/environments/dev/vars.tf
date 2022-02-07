variable "ENV" {
  default = "dev"
}

variable "BRANCH_NAME" {
  default = "dev"
}

variable "FEATURE_NAME" {
  default = "marketing"
}

variable "CODESTAR_CONNECTOR_CREDENTIALS" {
  default = "arn:aws:codestar-connections:ap-southeast-1:249593777629:connection/f7623ad7-387d-4abc-ae08-7b83cd464851"
}

variable "DOMAIN_NAME" {
  default = "traveloffice.shop"
}

variable "HOSTED_ZONE_ID" {
  default = "Z0837421MRKFPV1O1ZCI"
}

variable "DOMAIN_CERTIFICATE_ARN" {
  default = "arn:aws:acm:ap-southeast-1:249593777629:certificate/2b282e8a-acad-4b69-aca0-9a6906e62c5f"
}