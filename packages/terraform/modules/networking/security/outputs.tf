output "lambda_security_group_id" {
  description = "ID of the Lambda security group"
  value       = aws_security_group.lambda.id
}

output "rds_security_group_id" {
  description = "ID of the RDS security group"
  value       = aws_security_group.rds.id
}

output "endpoints_security_group_id" {
  description = "ID of the VPC endpoints security group"
  value       = aws_security_group.endpoints.id
}
