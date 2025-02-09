output "s3_endpoint_id" {
  description = "ID of the S3 VPC endpoint"
  value       = aws_vpc_endpoint.s3.id
}

output "dynamodb_endpoint_id" {
  description = "ID of the DynamoDB VPC endpoint"
  value       = aws_vpc_endpoint.dynamodb.id
}

output "lambda_endpoint_id" {
  description = "ID of the Lambda VPC endpoint"
  value       = aws_vpc_endpoint.lambda.id
}

output "sqs_endpoint_id" {
  description = "ID of the SQS VPC endpoint"
  value       = aws_vpc_endpoint.sqs.id
}

output "endpoint_dns_entries" {
  description = "DNS entries for the VPC endpoints"
  value = {
    lambda = aws_vpc_endpoint.lambda.dns_entry
    sqs    = aws_vpc_endpoint.sqs.dns_entry
  }
}
