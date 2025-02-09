output "function_arn" {
  description = "ARN of the batch processor Lambda function"
  value       = aws_lambda_function.batch_processor.arn
}

output "function_name" {
  description = "Name of the batch processor Lambda function"
  value       = aws_lambda_function.batch_processor.function_name
}
