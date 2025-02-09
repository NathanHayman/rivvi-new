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

variable "inbound_context_table" {
  description = "Name of inbound context DynamoDB table"
  type        = string
}