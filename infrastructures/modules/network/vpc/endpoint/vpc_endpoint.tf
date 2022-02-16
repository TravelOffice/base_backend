variable "ENV" {}
variable "FEATURE_NAME" {}
variable "VPC_ID" {}
variable "SUBNET_IDS" {}
variable "SERVICE_NAME" {}
variable "ENDPOINT_TYPE" {
  default = "Interface"
}
variable "TAGS" {}

resource "aws_vpc_endpoint" "ec2" {
  vpc_id            = var.VPC_ID
  subnet_ids        = var.SUBNET_IDS
  service_name      = var.SERVICE_NAME
  vpc_endpoint_type = var.ENDPOINT_TYPE

  security_group_ids = [
    aws_security_group.endpoint_sg.id,
  ]

  private_dns_enabled = true
  tags                = var.TAGS
}

resource "aws_security_group" "endpoint_sg" {
  name_prefix = "vpc_endpoint_sg"
  description = "Allow all outbound traffic"
  vpc_id      = var.VPC_ID

  ingress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
  tags = var.TAGS
}
