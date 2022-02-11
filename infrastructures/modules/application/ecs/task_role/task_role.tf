variable "ROLE_NAME" {}
variable "TAGS" {}

resource "aws_iam_role" "role" {
  name_prefix = "${var.ROLE_NAME}-task-execution-role"
  tags        = var.TAGS
  path        = "/"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          "Service" : "ecs-tasks.amazonaws.com"
        }
      },
    ]
  })
  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    "arn:aws:iam::aws:policy/AmazonS3FullAccess",
    "arn:aws:iam::aws:policy/AmazonRoute53FullAccess",
  ]
}

output "task_role_arn" {
  value = aws_iam_role.role.arn
}
