variable "LAMBDA_LAYERS" {}
variable "LAMBDA_FUNCTIONS" {}
variable "API_ENDPOINTS" {}
variable "LAMBDA_TRIGGERS" {}
variable "LAMBDA_CRONS" {}
variable "TF_BUCKET" {}
variable "ENV" {}
locals {
  remote_feature_name = "base_infrastructure"
  root_path           = format("%s/../..", path.root)
  env_vars = {
    lambda_ecs_service_vars = {
      NODE_ENV                     = var.ENV
      ECS_CLUSTER_ARN              = module.ECS.arn
      ECS_CLUSTER_NAME             = module.ECS.name
      ECS_LAUNCH_TYPE              = "FARGATE"
      ECS_SUBNET                   = module.REMOTE_STATE.STATE.BASE_INFRASTRUCTURE.backend.vpc.public_subnets[0]
      ECS_TASK_DEFINITION_ARN      = module.ECS.task_definition_arn
      ECS_TASK_DEFINITION_NAME     = module.ECS.task_definition_name
      SECRET_MANAGER_ID            = module.REMOTE_STATE.STATE.BASE_INFRASTRUCTURE.backend.secret_manager.id
      POST_TENANT_PROVISION_LAMBDA = "${var.ENV}-${var.FEATURE_NAME}-lambda_post_tenant_provision"
      STATE_MACHINE_ARN            = module.tenant_provision_step_function.arn
    }
    standard_vars = {
      NODE_ENV          = var.ENV
      SECRET_MANAGER_ID = module.REMOTE_STATE.STATE.BASE_INFRASTRUCTURE.backend.secret_manager.id
    }
  }

  tags = {
    Env       = var.ENV
    Terraform = true
    Feature   = var.FEATURE_NAME
  }
}

module "REMOTE_STATE" {
  source              = "../../modules/tf_remote_state"
  ENV                 = var.ENV
  REMOTE_TF_BUCKET    = var.TF_BUCKET
  REMOTE_FEATURE_NAME = local.remote_feature_name
  REMOTE_AWS_REGION   = var.AWS_REGION
}
module "LAMBDA_LAYER" {
  source        = "TravelOffice/lambda-layer/aws"
  LAMBDA_LAYERS = var.LAMBDA_LAYERS
  ENV           = var.ENV
  FEATURE_NAME  = var.FEATURE_NAME
  TAGS          = local.tags
}

module "LAMBDA_FUNCTION" {
  source            = "TravelOffice/lambda/aws"
  LAMBDA_FUNCTIONS  = var.LAMBDA_FUNCTIONS
  LAMBDA_LAYER_ARNS = module.LAMBDA_LAYER.lambda_layer_arns
  VPC_ID            = module.REMOTE_STATE.STATE.BASE_INFRASTRUCTURE.backend.vpc.id
  LAMBDA_SG_ID      = module.REMOTE_STATE.STATE.BASE_INFRASTRUCTURE.backend.vpc.security_groups.lambda_sg
  SUBNETS           = module.REMOTE_STATE.STATE.BASE_INFRASTRUCTURE.backend.vpc.private_subnets
  ENV               = var.ENV
  FEATURE_NAME      = var.FEATURE_NAME
  ENV_VARS          = local.env_vars
  TAGS              = local.tags
}

module "API_GATEWAY" {
  source                 = "TravelOffice/apigateway/aws"
  LAMBDA_ARNS            = module.LAMBDA_FUNCTION.lambda_arns
  API_ENDPOINTS          = var.API_ENDPOINTS
  AWS_REGION             = var.AWS_REGION
  FEATURE_NAME           = var.FEATURE_NAME
  DOMAIN_NAME            = module.REMOTE_STATE.STATE.COMMON_CONFIG.route53.hosted_zone.domain.name
  HOSTED_ZONE_ID         = module.REMOTE_STATE.STATE.COMMON_CONFIG.route53.hosted_zone.id
  DOMAIN_CERTIFICATE_ARN = module.REMOTE_STATE.STATE.COMMON_CONFIG.route53.hosted_zone.domain.certificate.arn
  COGNITO_USER_POOL_ARN  = module.REMOTE_STATE.STATE.COMMON_CONFIG.cognito.user_pool.arn
  ENV                    = var.ENV
  TAGS                   = local.tags

}

module "LAMBDA_CRON" {
  source       = "../../modules/event/lambda_cron"
  FEATURE_NAME = var.FEATURE_NAME
  LAMBDA_CRONS = var.LAMBDA_CRONS
  LAMBDA_ARNS  = module.LAMBDA_FUNCTION.lambda_arns
  ENV          = var.ENV
  TAGS         = local.tags
}


module "ECS" {
  source        = "../../modules/application/ecs"
  FEATURE_NAME  = var.FEATURE_NAME
  ENV           = var.ENV
  CUSTOM_POLICIES = [
    "EcsTaskStandardRole",
    "Route53ChangeRecord",
    "DynamoTableReadWrite"
  ]
  AWS_POLICIES = [
    "service-role/AmazonECSTaskExecutionRolePolicy"
  ]
  TAGS          = local.tags
}

module "cognito_pre_sign_up_trigger" {
  source               = "../../modules/application/cognito_trigger"
  COGNITO_USER_POOL_ID = module.REMOTE_STATE.STATE.COMMON_CONFIG.cognito.user_pool.id
  LAMBDA_TRIGGERS      = var.LAMBDA_TRIGGERS
  LAMBDA_ARNS          = module.LAMBDA_FUNCTION.lambda_arns
  ENV                  = var.ENV
  FEATURE_NAME         = var.FEATURE_NAME
  AWS_REGION           = var.AWS_REGION
}

module "tenant_provision_step_function" {
  source        = "../../modules/application/step_function"
  ENV           = var.ENV
  NAME          = "${var.ENV}-tenant-provision"
  ECS_ARN       = module.ECS.arn
  ECS_TASK_ARN  = module.ECS.task_definition_arn
  TEMPLATE_FILE = "tenant_provision.tftpl"
  TAGS          = local.tags
  CUSTOM_POLICIES = [
    "StandardStepFunction",
    "ExecuteEcsTask",
    "DynamoTableReadWrite",
    "SESSendMail"
  ]
}
