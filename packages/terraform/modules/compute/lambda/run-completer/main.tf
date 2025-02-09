resource "aws_lambda_function" "run_completer" {
  filename         = var.filename
  function_name    = "rivvi-run-completer-${var.environment}"
  role            = var.role_arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 900  # 15 minutes
  memory_size     = 1024

  environment {
    variables = {
      ACTIVE_RUNS_TABLE = var.active_runs_table
      RUN_DATA_TABLE = var.run_data_table
      RDS_SECRET_ARN = var.rds_secret_arn
      RDS_CLUSTER_ARN = var.rds_cluster_arn
    }
  }

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = var.security_group_ids
  }

  tags = {
    Name        = "rivvi-run-completer-${var.environment}"
    Environment = var.environment
  }
}

# SQS Event Source
resource "aws_lambda_event_source_mapping" "run_completer" {
  event_source_arn = var.batch_queue_arn
  function_name    = aws_lambda_function.run_completer.arn
  batch_size       = 10
  maximum_batching_window_in_seconds = 300
}