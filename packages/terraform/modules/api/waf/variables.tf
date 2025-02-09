variable "environment" {
  description = "Environment name"
  type        = string
}

variable "api_gateway_arn" {
  description = "ARN of the API Gateway to associate with WAF"
  type        = string
}
