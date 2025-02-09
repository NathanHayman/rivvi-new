provider "aws" {
  region = var.region
}

# KMS key for encryption
resource "aws_kms_key" "main" {
  description             = "KMS key for Rivvi application"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name        = "rivvi-${var.environment}"
    Environment = var.environment
  }
}

# Networking
module "vpc" {
  source = "../../modules/networking/vpc"

  name                = "rivvi-${var.environment}"
  cidr_block         = var.vpc_cidr
  private_subnet_cidrs = var.private_subnet_cidrs
  public_subnet_cidrs  = var.public_subnet_cidrs
  availability_zones   = var.availability_zones
}

module "security_groups" {
  source = "../../modules/networking/security"

  vpc_id      = module.vpc.vpc_id
  environment = var.environment
}

module "vpc_endpoints" {
  source = "../../modules/networking/endpoints"

  vpc_id                    = module.vpc.vpc_id
  region                    = var.region
  environment              = var.environment
  private_subnet_ids       = module.vpc.private_subnet_ids
  private_route_table_ids  = module.vpc.private_route_table_ids
  endpoint_security_group_id = module.security_groups.endpoints_security_group_id
}

# Storage
module "s3" {
  source = "../../modules/storage/s3"

  bucket_name = "rivvi-${var.environment}"
  kms_key_id  = aws_kms_key.main.id
  environment = var.environment
}

module "dynamodb" {
  source = "../../modules/storage/dynamodb"

  environment = var.environment
  kms_key_arn = aws_kms_key.main.arn
}

module "rds" {
  source = "../../modules/storage/rds"

  environment       = var.environment
  subnet_ids        = module.vpc.private_subnet_ids
  security_group_id = module.security_groups.rds_security_group_id
  kms_key_id       = aws_kms_key.main.id
}

# Lambda Functions
module "webhook_handler" {
  source = "../../modules/compute/lambda/webhook-handler"

  filename            = "webhook_handler.zip"
  vpc_config          = {
    subnet_ids         = module.vpc.private_subnet_ids
    security_group_ids = [module.security_groups.lambda_security_group_id]
  }
  role_arn            = module.iam.lambda_role_arn
  api_gateway_execution_arn = module.api_gateway.execution_arn
  environment         = var.environment
}

module "inbound_handler" {
  source = "../../modules/compute/lambda/inbound-handler"

  filename            = "inbound_handler.zip"
  vpc_config          = {
    subnet_ids         = module.vpc.private_subnet_ids
    security_group_ids = [module.security_groups.lambda_security_group_id]
  }
  role_arn            = module.iam.lambda_role_arn
  environment         = var.environment
}

# API Gateway and WAF
module "api_gateway" {
  source = "../../modules/api/gateway"

  environment             = var.environment
  webhook_lambda_invoke_arn = module.webhook_handler.invoke_arn
  inbound_lambda_invoke_arn = module.inbound_handler.invoke_arn
}

# Event Processing
module "eventbridge" {
  source = "../../modules/events/eventbridge"

  environment = var.environment
  run_activator_lambda_arn = module.run_activator.function_arn
  call_dispatcher_lambda_arn = module.call_dispatcher.function_arn
}

module "sqs" {
  source = "../../modules/events/sqs"

  environment = var.environment
}

# Monitoring
module "cloudwatch" {
  source = "../../modules/monitoring/cloudwatch"

  environment = var.environment
  region      = var.region
}

module "alarms" {
  source = "../../modules/monitoring/alarms"

  environment   = var.environment
  sns_topic_arn = aws_sns_topic.alerts.arn
}

# Frontend
module "frontend" {
  source = "../../modules/frontend"

  environment      = var.environment
  domain_name     = var.domain_name
  api_gateway_url = module.api_gateway.invoke_url
}

# IAM
module "iam" {
  source = "../../modules/iam"

  environment          = var.environment
  raw_bucket_arn      = module.s3.raw_bucket_arn
  processed_bucket_arn = module.s3.processed_bucket_arn
  call_logs_bucket_arn = module.s3.call_logs_bucket_arn
  dynamodb_table_arn   = module.dynamodb.table_arn
  rds_cluster_arn     = module.rds.cluster_arn
}