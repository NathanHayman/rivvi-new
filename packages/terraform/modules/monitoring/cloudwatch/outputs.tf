output "api_log_group_arn" {
  description = "ARN of the API Gateway CloudWatch log group"
  value       = aws_cloudwatch_log_group.api_gateway.arn
}

output "webhook_lambda_log_group_arn" {
  description = "ARN of the webhook Lambda CloudWatch log group"
  value       = aws_cloudwatch_log_group.lambda_webhook.arn
}

output "processor_lambda_log_group_arn" {
  description = "ARN of the processor Lambda CloudWatch log group"
  value       = aws_cloudwatch_log_group.lambda_processor.arn
}

output "dashboard_name" {
  description = "Name of the CloudWatch dashboard"
  value       = aws_cloudwatch_dashboard.main.dashboard_name
}
