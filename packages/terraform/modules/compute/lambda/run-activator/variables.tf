variable "environment" {
  description = "Environment name"
  type        = string
}

variable "filename" {
  description = "Path to Lambda deployment package"
  type        = string
}

variable "role_arn" {
  description = "IAM role ARN for Lambda execution"
  type        = string
}

variable "vpc_config" {
  description = "VPC configuration for Lambda"
  type = object({
    subnet_ids         = list(string)
    security_group_ids = list(string)
  })
}

variable "processed_data_bucket" {
  description = "Name of processed data S3 bucket"
  type        = string
}

variable "active_runs_table" {
  description = "Name of active runs DynamoDB table"
  type        = string
}

variable "run_data_table" {
  description = "Name of run data DynamoDB table"
  type        = string
}

variable "max_concurrent_calls" {
  description = "Maximum number of concurrent calls per organization"
  type        = number
  default     = 20
}