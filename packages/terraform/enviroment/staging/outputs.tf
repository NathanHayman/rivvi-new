output "vpc_id" {
  description = "ID of the VPC"
  value       = module.common.vpc_id
}

output "api_invoke_url" {
  description = "URL to invoke the API Gateway"
  value       = module.common.api_invoke_url
}

output "rds_endpoint" {
  description = "Endpoint of the RDS cluster"
  value       = module.common.rds_endpoint
}

output "raw_data_bucket" {
  description = "Name of the raw data S3 bucket"
  value       = module.common.raw_data_bucket
}

output "processed_data_bucket" {
  description = "Name of the processed data S3 bucket"
  value       = module.common.processed_data_bucket
}

output "call_logs_bucket" {
  description = "Name of the call logs S3 bucket"
  value       = module.common.call_logs_bucket
}

output "dynamodb_table" {
  description = "Name of the DynamoDB table"
  value       = module.common.dynamodb_table
}

output "sqs_queue_url" {
  description = "URL of the SQS queue"
  value       = module.common.sqs_queue_url
}
