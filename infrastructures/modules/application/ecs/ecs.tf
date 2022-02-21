variable "ENV" {}
variable "FEATURE_NAME" {}
variable "ECS_TASK_ROLE" {}
variable "TAGS" {}

module "ECS_CLUSTER" {
  source = "terraform-aws-modules/ecs/aws"

  name = "${upper("${var.ENV}-${var.FEATURE_NAME}")}-CLUSTER"

  container_insights = true

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

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

module "ECS_TASK_DEFINITION" {
  source        = "./task_definition"
  TASK_NAME     = "${var.ENV}-${var.FEATURE_NAME}"
  TASK_ROLE_ARN = var.ECS_TASK_ROLE
  IMAGE_URI     = module.ECS_DOCKER_IMAGE.image_uri
  ENV           = var.ENV
  TAGS          = var.TAGS
}

output "name" {
  value = module.ECS_CLUSTER.ecs_cluster_name
}

output "task_definition_arn" {
  value = module.ECS_TASK_DEFINITION.task_arn
}

output "task_definition_name" {
  value = "${var.ENV}-${var.FEATURE_NAME}"
}