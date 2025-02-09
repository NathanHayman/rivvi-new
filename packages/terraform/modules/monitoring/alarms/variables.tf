variable "environment" {
  description = "Environment name"
  type        = string
}

variable "sns_topic_arn" {
  description = "ARN of the SNS topic for alarm notifications"
  type        = string
}
