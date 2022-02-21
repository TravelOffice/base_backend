variable "ENV" {}
variable "TF_BUCKET" {}
variable "TENANT_NAME" {}

locals {
  remote_feature_name = "base_infrastructure"
}
module "REMOTE_STATE" {
  source              = "./modules/tf_remote_state"
  ENV                 = var.ENV
  REMOTE_TF_BUCKET    = var.TF_BUCKET
  REMOTE_FEATURE_NAME = local.remote_feature_name
  REMOTE_AWS_REGION   = var.AWS_REGION
}

resource "aws_route53_record" "www" {
  zone_id = var.HOSTED_ZONE_ID
  name    = var.TENANT_NAME
  type    = "CNAME"
  ttl     = "300"
  records = [module.REMOTE_STATE.STATE.MARKETING.frontend.sale_web.cdn_domain]
}