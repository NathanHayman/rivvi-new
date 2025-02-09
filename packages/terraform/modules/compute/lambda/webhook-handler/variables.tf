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

variable "environment_variables" {
  description = "Environment variables for Lambda function"
  type        = map(string)
  default     = {}
}

variable "api_gateway_execution_arn" {
  description = "API Gateway execution ARN"
  type        = string
}
