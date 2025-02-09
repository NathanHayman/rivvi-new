output "api_errors_alarm_arn" {
  description = "ARN of the API errors alarm"
  value       = aws_cloudwatch_metric_alarm.api_errors.arn
}

output "lambda_errors_alarm_arn" {
  description = "ARN of the Lambda errors alarm"
  value       = aws_cloudwatch_metric_alarm.lambda_errors.arn
}

output "dynamodb_throttles_alarm_arn" {
  description = "ARN of the DynamoDB throttles alarm"
  value       = aws_cloudwatch_metric_alarm.dynamodb_throttles.arn
}

output "dlq_messages_alarm_arn" {
  description = "ARN of the DLQ messages alarm"
  value       = aws_cloudwatch_metric_alarm.dlq_messages.arn
}
