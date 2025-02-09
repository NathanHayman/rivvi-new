# SQS Queue for batch processing
resource "aws_sqs_queue" "batch_queue" {
  name                       = "rivvi-batch-${var.environment}"
  visibility_timeout_seconds = 900
  message_retention_seconds  = 86400
  delay_seconds             = 0
  
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.batch_dlq.arn
    maxReceiveCount     = 3
  })

  tags = {
    Name        = "rivvi-batch-${var.environment}"
    Environment = var.environment
  }
}

# Dead Letter Queue
resource "aws_sqs_queue" "batch_dlq" {
  name                       = "rivvi-batch-dlq-${var.environment}"
  message_retention_seconds  = 1209600 # 14 days
  
  tags = {
    Name        = "rivvi-batch-dlq-${var.environment}"
    Environment = var.environment
  }
}

# Batch Processor Lambda
resource "aws_lambda_function" "batch_processor" {
  filename         = var.filename
  function_name    = "rivvi-batch-processor-${var.environment}"
  role            = var.role_arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 900
  memory_size     = 1024

  environment {
    variables = {
      DYNAMODB_TABLE = var.dynamodb_table_name
      RDS_SECRET_ARN = var.rds_secret_arn
      RDS_CLUSTER_ARN = var.rds_cluster_arn
      ACTIVE_RUNS_TABLE = var.active_runs_table
      CALL_EVENTS_TABLE = var.call_events_table
    }
  }

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = var.security_group_ids
  }

  tags = {
    Name        = "rivvi-batch-processor-${var.environment}"
    Environment = var.environment
  }
}

# Event source mapping
resource "aws_lambda_event_source_mapping" "batch_processor" {
  event_source_arn = aws_sqs_queue.batch_queue.arn
  function_name    = aws_lambda_function.batch_processor.arn
  batch_size       = 10
  maximum_batching_window_in_seconds = 300
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "dlq_messages" {
  alarm_name          = "batch-dlq-messages-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = "300"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "Batch processing DLQ has messages"
  alarm_actions       = [var.alarm_topic_arn]

  dimensions = {
    QueueName = aws_sqs_queue.batch_dlq.name
  }
}

resource "aws_cloudwatch_metric_alarm" "batch_errors" {
  alarm_name          = "batch-processor-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "5"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "High number of batch processing errors"
  alarm_actions       = [var.alarm_topic_arn]

  dimensions = {
    FunctionName = aws_lambda_function.batch_processor.function_name
  }
}
