variable "TASK_ROLE_ARN" {}
variable "TASK_NAME" {}
variable "IMAGE_URI" {}
variable "ENV" {}
variable "FUNCTION_HANDLER" {
  default = "app.handler"
}
variable "TAGS" {}


resource "aws_ecs_task_definition" "task" {
  family                   = var.TASK_NAME
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  task_role_arn            = var.TASK_ROLE_ARN
  execution_role_arn       = var.TASK_ROLE_ARN
  cpu                      = 256
  memory                   = 512
  container_definitions = jsonencode([
    {
      name                   = var.TASK_NAME
      image                  = var.IMAGE_URI
      essential              = true
      readonlyRootFilesystem = false
      "linuxParameters" = {
        "initProcessEnabled" : true
      }
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
        }
      ]
      environment = [
        {
          name  = "FUNCTION_HANDLER"
          value = var.FUNCTION_HANDLER
        },
        {
          name  = "TF_ENV"
          value = var.ENV
        }
      ]
      "logConfiguration" : {
        "logDriver" : "awslogs",
        "secretOptions" : null,
        "options" : {
          "awslogs-group" : "/ecs/${var.TASK_NAME}",
          "awslogs-region" : "ap-southeast-1",
          "awslogs-create-group" : "true",
          "awslogs-stream-prefix" : "ecs"
        }
      }
    }
  ])

}

output "task_arn" {
  value = aws_ecs_task_definition.task.arn
}
