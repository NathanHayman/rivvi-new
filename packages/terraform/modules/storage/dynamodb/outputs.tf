output "table_id" {
  description = "The name of the table"
  value       = aws_dynamodb_table.table.id
}

output "table_arn" {
  description = "The ARN of the table"
  value       = aws_dynamodb_table.table.arn
}

output "stream_arn" {
  description = "The ARN of the table's stream"
  value       = aws_dynamodb_table.table.stream_arn
}
