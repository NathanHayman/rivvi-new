# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "IDs of private subnets"
  value       = module.vpc.private_subnet_ids
}

output "public_subnet_ids" {
  description = "IDs of public subnets"
  value       = module.vpc.public_subnet_ids
}

# Storage Outputs
output "s3_buckets" {
  description = "S3 bucket names"
  value = {
    raw_data     = module.s3.raw_bucket_name
    processed    = module.s3.processed_bucket_name
    call_logs    = module.s3.call_logs_bucket_name
  }
}

output "dynamodb_tables" {
  description = "DynamoDB table names"
  value = {
    active_runs = module.dynamodb.active_runs_table_name
    run_data    = module.dynamodb.run_data_table_name
  }
}

output "rds_endpoint" {
  description = "RDS cluster endpoint"
  value       = module.rds.cluster_endpoint
}

# Lambda Function Outputs
output "lambda_functions" {
  description = "Lambda function configurations"
  value = {
    webhook_handler = {
      name = module.webhook_handler.function_name
      arn  = module.webhook_handler.function_arn
    }
    inbound_handler = {
      name = module.inbound_handler.function_name
      arn  = module.inbound_handler.function_arn
    }
    run_activator = {
      name = module.run_activator.function_name
      arn  = module.run_activator.function_arn
    }
    call_dispatcher = {
      name = module.call_dispatcher.function_name
      arn  = module.call_dispatcher.function_arn
    }
    run_completer = {
      name = module.run_completer.function_name
      arn  = module.run_completer.function_arn
    }
  }
}

# API Gateway Outputs
output "api_gateway_url" {
  description = "URL of the API Gateway"
  value       = module.api_gateway.invoke_url
}

output "api_gateway_stage" {
  description = "API Gateway stage name"
  value       = module.api_gateway.stage_name
}

# Event Processing Outputs
output "sqs_queues" {
  description = "SQS queue URLs"
  value = {
    batch_queue = module.sqs.queue_url
    batch_dlq   = module.sqs.dlq_url
  }
}

# Frontend Outputs
output "cloudfront_domain_name" {
  description = "Domain name of CloudFront distribution"
  value       = module.frontend.cloudfront_domain_name
}

output "frontend_bucket" {
  description = "Name of the S3 bucket hosting frontend assets"
  value       = module.frontend.bucket_name
}

# Security Outputs
output "kms_key_arn" {
  description = "ARN of the KMS key"
  value       = aws_kms_key.main.arn
}

output "security_groups" {
  description = "Security group IDs"
  value = {
    lambda     = module.security_groups.lambda_security_group_id
    rds        = module.security_groups.rds_security_group_id
    endpoints  = module.security_groups.endpoints_security_group_id
  }
}

# VPC Endpoint Outputs
output "vpc_endpoints" {
  description = "VPC endpoint IDs"
  value = {
    s3        = module.vpc_endpoints.s3_endpoint_id
    dynamodb  = module.vpc_endpoints.dynamodb_endpoint_id
    lambda    = module.vpc_endpoints.lambda_endpoint_id
    sqs       = module.vpc_endpoints.sqs_endpoint_id
  }
}

# Monitoring Outputs
output "cloudwatch_log_groups" {
  description = "CloudWatch log group names"
  value = {
    api_gateway = module.cloudwatch.api_log_group_arn
    lambda      = module.cloudwatch.lambda_log_group_arns
  }
}

output "alarm_topic_arn" {
  description = "ARN of the SNS topic for alarms"
  value       = aws_sns_topic.alerts.arn
}