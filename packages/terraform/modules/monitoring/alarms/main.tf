# API Gateway error rate alarm
resource "aws_cloudwatch_metric_alarm" "api_errors" {
  alarm_name          = "rivvi-api-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "This metric monitors API Gateway 5XX errors"
  
  dimensions = {
    ApiName = "rivvi-${var.environment}"
  }

  alarm_actions = [var.sns_topic_arn]
}

# Lambda error rate alarm
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "rivvi-lambda-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "This metric monitors Lambda function errors"
  
  dimensions = {
    FunctionName = "rivvi-webhook-${var.environment}"
  }

  alarm_actions = [var.sns_topic_arn]
}

# DynamoDB throttling alarm
resource "aws_cloudwatch_metric_alarm" "dynamodb_throttles" {
  alarm_name          = "rivvi-dynamodb-throttles-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ThrottledRequests"
  namespace           = "AWS/DynamoDB"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "This metric monitors DynamoDB throttled requests"
  
  dimensions = {
    TableName = "rivvi-active-runs-${var.environment}"
  }

  alarm_actions = [var.sns_topic_arn]
}

# SQS dead-letter queue messages alarm
resource "aws_cloudwatch_metric_alarm" "dlq_messages" {
  alarm_name          = "rivvi-dlq-messages-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = "300"
  statistic           = "Average"
  threshold           = "0"
  alarm_description   = "This metric monitors messages in DLQ"
  
  dimensions = {
    QueueName = "rivvi-batch-processing-dlq-${var.environment}"
  }

  alarm_actions = [var.sns_topic_arn]
}
