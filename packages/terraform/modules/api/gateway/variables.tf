variable "environment" {
  description = "Environment name"
  type        = string
}

variable "webhook_lambda_invoke_arn" {
  description = "ARN for Lambda function integration"
  type        = string
}

variable "cloudwatch_log_group_arn" {
  description = "ARN of CloudWatch log group for API Gateway access logs"
  type        = string
}
