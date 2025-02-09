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

variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  type        = string
}

variable "rds_secret_arn" {
  description = "ARN of RDS secret in Secrets Manager"
  type        = string
}

variable "rds_cluster_arn" {
  description = "ARN of RDS cluster"
  type        = string
}

variable "active_runs_table" {
  description = "Name of active runs DynamoDB table"
  type        = string
}

variable "call_events_table" {
  description = "Name of call events DynamoDB table"
  type        = string
}

variable "alarm_topic_arn" {
  description = "ARN of SNS topic for alarms"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for Lambda VPC config"
  type        = list(string)
}

variable "security_group_ids" {
  description = "List of security group IDs for Lambda VPC config"
  type        = list(string)
}