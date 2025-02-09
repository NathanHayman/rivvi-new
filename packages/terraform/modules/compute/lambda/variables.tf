variable "filename" {
  description = "Path to the Lambda deployment package"
  type        = string
}

variable "function_name" {
  description = "Name of the Lambda function"
  type        = string
}

variable "role_arn" {
  description = "ARN of the IAM role for the Lambda function"
  type        = string
}

variable "handler" {
  description = "Function entrypoint in code"
  type        = string
}

variable "runtime" {
  description = "Lambda runtime"
  type        = string
}

variable "memory_size" {
  description = "Amount of memory in MB for the function"
  type        = number
  default     = 128
}

variable "timeout" {
  description = "Function timeout in seconds"
  type        = number
  default     = 30
}

variable "environment_variables" {
  description = "Environment variables for the function"
  type        = map(string)
  default     = {}
}

variable "subnet_ids" {
  description = "List of subnet IDs for VPC config"
  type        = list(string)
  default     = []
}

variable "security_group_ids" {
  description = "List of security group IDs for VPC config"
  type        = list(string)
  default     = []
}

variable "source_code_hash" {
  description = "Base64-encoded SHA256 hash of the package file"
  type        = string
}
