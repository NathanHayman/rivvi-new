# Environment
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.4.0/24", "10.0.5.0/24", "10.0.6.0/24"]
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

# Application Configuration
variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "dev.rivvi.io"
}

variable "max_concurrent_calls" {
  description = "Maximum number of concurrent calls per organization"
  type        = number
  default     = 20
}

# RDS Configuration
variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "rds_backup_retention_days" {
  description = "Number of days to retain RDS backups"
  type        = number
  default     = 7
}

# DynamoDB Configuration
variable "dynamodb_ttl_days" {
  description = "Number of days before DynamoDB records expire"
  type        = number
  default     = 7
}

# S3 Configuration
variable "s3_lifecycle_glacier_days" {
  description = "Number of days before transitioning to Glacier storage"
  type        = number
  default     = 30
}

variable "s3_lifecycle_expiration_days" {
  description = "Number of days before object expiration"
  type        = number
  default     = 365
}

# Lambda Configuration
variable "lambda_memory_sizes" {
  description = "Memory sizes for Lambda functions"
  type        = map(number)
  default     = {
    webhook_handler  = 256
    inbound_handler = 256
    run_activator   = 512
    call_dispatcher = 256
    run_completer   = 1024
  }
}

variable "lambda_timeouts" {
  description = "Timeout values for Lambda functions"
  type        = map(number)
  default     = {
    webhook_handler  = 30
    inbound_handler = 30
    run_activator   = 300
    call_dispatcher = 60
    run_completer   = 900
  }
}

# CloudWatch Configuration
variable "log_retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 30
}

# WAF Configuration
variable "waf_rate_limit" {
  description = "Rate limit for WAF rules"
  type        = number
  default     = 2000
}

# SQS Configuration
variable "sqs_message_retention_seconds" {
  description = "Time in seconds to keep messages in SQS queues"
  type        = number
  default     = 86400 # 24 hours
}

variable "sqs_visibility_timeout_seconds" {
  description = "Time in seconds during which a message is invisible after being read"
  type        = number
  default     = 900 # 15 minutes
}

# KMS Configuration
variable "kms_deletion_window_days" {
  description = "Waiting period before KMS key deletion"
  type        = number
  default     = 7
}

# Tags
variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {
    Project     = "Rivvi"
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}