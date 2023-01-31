data "http" "infra" {
  url = "https://raw.githubusercontent.com/TravelOffice/infrastructure-constant/master/${var.ENV}-infrastructure.json"
}

variable "ENV" {}
variable "TENANT_NAME" {}

locals {
  remote_feature_name = "base_infrastructure"
  constants           = jsondecode(data.http.infra.body)
  remote_tf_bucket    = local.constants["TF_STATE_BUCKET"]

}
module "REMOTE_STATE" {
  source              = "./modules/tf_remote_state"
  ENV                 = var.ENV
  REMOTE_TF_BUCKET    = local.remote_tf_bucket
  REMOTE_FEATURE_NAME = local.remote_feature_name
  REMOTE_AWS_REGION   = var.AWS_REGION
}

resource "aws_route53_record" "www" {
  zone_id = module.REMOTE_STATE.STATE.COMMON_CONFIG.route53.hosted_zone.id
  name    = var.TENANT_NAME
  type    = "CNAME"
  ttl     = "300"
  records = [module.REMOTE_STATE.STATE.MARKETING.frontend.sale_web.cdn_domain]
}