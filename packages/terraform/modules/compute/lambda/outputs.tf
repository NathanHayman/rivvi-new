output "function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.lambda.arn
}

output "function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.lambda.function_name
}

output "invoke_arn" {
  description = "Invoke ARN of the Lambda function"
  value       = aws_lambda_function.lambda.invoke_arn
}

output "qualified_arn" {
  description = "ARN identifying your Lambda Function Version"
  value       = aws_lambda_function.lambda.qualified_arn
}

output "function_url" {
  description = "URL of the Lambda function"
  value       = try(aws_lambda_function_url.function_url[0].url, null)
}
