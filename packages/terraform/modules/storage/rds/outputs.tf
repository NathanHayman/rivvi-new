output "cluster_endpoint" {
  description = "Writer endpoint for the cluster"
  value       = aws_rds_cluster.main.endpoint
}

output "cluster_reader_endpoint" {
  description = "Reader endpoint for the cluster"
  value       = aws_rds_cluster.main.reader_endpoint
}

output "cluster_id" {
  description = "The RDS Cluster Identifier"
  value       = aws_rds_cluster.main.id
}

output "cluster_arn" {
  description = "The RDS Cluster ARN"
  value       = aws_rds_cluster.main.arn
}

output "database_name" {
  description = "The database name"
  value       = aws_rds_cluster.main.database_name
}
