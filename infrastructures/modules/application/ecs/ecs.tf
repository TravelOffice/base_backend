variable "ENV" {}
variable "FEATURE_NAME" {}
variable "TAGS" {}

locals {
  root_path = format("%s/../../../..", path.module)
}

module "ECS_CLUSTER" {
  source = "terraform-aws-modules/ecs/aws"

  name = "${upper("${var.ENV}-${var.FEATURE_NAME}")}-CLUSTER"

  container_insights = true

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  tags = var.TAGS
}

module "ECS_TASK_ROLE" {
  source    = "./task_role"
  ROLE_NAME = "${var.ENV}-${var.FEATURE_NAME}"
  TAGS      = var.TAGS
}


resource "aws_ecr_repository" "repo" {
  name                 = "test"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

module "docker_image" {
  source = "terraform-aws-modules/lambda/aws//modules/docker-build"

  ecr_repo        = "test"
  image_tag       = "1.0"
  source_path     = "context"
  build_args = {
    FOO = "bar"
  }
}

module "ECS_TASK_DEFINITION" {
  source        = "./task_definition"
  TASK_NAME     = "${var.ENV}-${var.FEATURE_NAME}"
  TASK_ROLE_ARN = module.ECS_TASK_ROLE.task_role_arn
  TAGS          = var.TAGS
}

module "ECS_DOCKER_IMAGE" {
  source = "terraform-aws-modules/lambda/aws//modules/docker-build"

  create_ecr_repo = true
  ecr_repo        = "my-cool-ecr-repo"
  image_tag       = "1.0"
  source_path     = "context"
  build_args = {
    FOO = "bar"
  }
}
