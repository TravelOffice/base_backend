variable "TENANT_NAME" {}
variable "TENANT_DOMAIN_RECORD_VALUE" {}

resource "aws_route53_record" "www" {
  zone_id = var.HOSTED_ZONE_ID
  name    = var.TENANT_NAME
  type    = "CNAME"
  ttl     = "300"
  records = [var.TENANT_DOMAIN_RECORD_VALUE]
}