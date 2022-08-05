variable "ENV" {}
variable "FEATURE_NAME" {}
variable "CUSTOM_POLICIES" {
  default = []
}
variable "AWS_POLICIES" {
  default = []
}
variable "TAGS" {}

locals {
  cluster_name = "${upper("${var.ENV}-${var.FEATURE_NAME}")}-CLUSTER"
}

module "ECS_CLUSTER" {
  source  = "terraform-aws-modules/ecs/aws"
  version = "4.0.1"

  cluster_name = local.cluster_name

  fargate_capacity_providers = {
    FARGATE = {
      default_capacity_provider_strategy = {
        weight = 100
      }
    }
  }

  tags = var.TAGS
}

resource "aws_ecr_repository" "repo" {
  name = "tenant_provision"
}

module "ECS_DOCKER_IMAGE" {
  source  = "terraform-aws-modules/lambda/aws//modules/docker-build"
  version = "2.34.0"

  ecr_repo                  = split("/", aws_ecr_repository.repo.repository_url)[1]
  ecr_repo_tags             = var.TAGS
  source_path               = format("%s/%s", "../../..", "src/modules/tenant_provision")
  ecr_repo_lifecycle_policy = <<EOF
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep only the last 2 images",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 2
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
EOF
}

data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

module "role" {
  source             = "../../role"
  NAME               = "${var.ENV}-tenant-provision-task"
  CUSTOM_POLICIES    = var.CUSTOM_POLICIES
  AWS_POLICIES       = var.AWS_POLICIES
  ASSUME_ROLE_POLICY = data.aws_iam_policy_document.assume_role_policy.json
  TAGS               = var.TAGS
}

module "ECS_TASK_DEFINITION" {
  source        = "./task_definition"
  TASK_NAME     = "${var.ENV}-${var.FEATURE_NAME}"
  TASK_ROLE_ARN = module.role.arn
  IMAGE_URI     = module.ECS_DOCKER_IMAGE.image_uri
  ENV           = var.ENV
  TAGS          = var.TAGS
}

output "name" {
  value = local.cluster_name
}

output "task_definition_arn" {
  value = module.ECS_TASK_DEFINITION.task_arn
}

output "task_definition_name" {
  value = "${var.ENV}-${var.FEATURE_NAME}"
}

output "arn" {
  value = module.ECS_CLUSTER.cluster_arn
}
