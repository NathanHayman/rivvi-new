variable "environment" {
  description = "Environment name"
  type        = string
}

variable "raw_bucket_arn" {
  description = "ARN of the raw data S3 bucket"
  type        = string
}

variable "processed_bucket_arn" {
  description = "ARN of the processed data S3 bucket"
  type        = string
}

variable "call_logs_bucket_arn" {
  description = "ARN of the call logs S3 bucket"
  type        = string
}

variable "dynamodb_table_arn" {
  description = "ARN of the DynamoDB table"
  type        = string
}

variable "sqs_queue_arn" {
  description = "ARN of the SQS queue"
  type        = string
}

variable "sqs_dlq_arn" {
  description = "ARN of the SQS dead-letter queue"
  type        = string
}

variable "rds_cluster_arn" {
  description = "ARN of the RDS cluster"
  type        = string
}

variable "kms_key_arn" {
  description = "ARN of the KMS key"
  type        = string
}
