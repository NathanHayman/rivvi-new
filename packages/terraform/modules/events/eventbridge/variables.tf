variable "environment" {
  description = "Environment name"
  type        = string
}

variable "run_activator_lambda_arn" {
  description = "ARN of the run activator Lambda function"
  type        = string
}

variable "call_dispatcher_lambda_arn" {
  description = "ARN of the call dispatcher Lambda function"
  type        = string
}

variable "scheduler_lambda_arn" {
  description = "ARN of the Lambda function to schedule runs"
  type        = string
}
