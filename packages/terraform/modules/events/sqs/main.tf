resource "aws_sqs_queue" "batch_processing" {
  name                       = "rivvi-batch-processing-${var.environment}"
  delay_seconds              = 0
  visibility_timeout_seconds = 300
  message_retention_seconds  = 86400
  max_message_size          = 262144

  # Enable server-side encryption
  sqs_managed_sse_enabled = true

  # Enable dead-letter queue
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.batch_processing_dlq.arn
    maxReceiveCount     = 3
  })

  tags = {
    Name        = "rivvi-batch-processing-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_sqs_queue" "batch_processing_dlq" {
  name                       = "rivvi-batch-processing-dlq-${var.environment}"
  message_retention_seconds  = 1209600 # 14 days
  sqs_managed_sse_enabled   = true

  tags = {
    Name        = "rivvi-batch-processing-dlq-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_sqs_queue_policy" "batch_processing" {
  queue_url = aws_sqs_queue.batch_processing.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.batch_processing.arn
      }
    ]
  })
}
