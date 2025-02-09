# Raw uploads bucket
resource "aws_s3_bucket" "raw_uploads" {
  bucket        = "rivvi-raw-uploads-${var.environment}"
  force_destroy = true

  tags = {
    Name        = "rivvi-raw-uploads-${var.environment}"
    Environment = var.environment
  }
}

# Processed data bucket
resource "aws_s3_bucket" "processed_data" {
  bucket        = "rivvi-processed-data-${var.environment}"
  force_destroy = true

  tags = {
    Name        = "rivvi-processed-data-${var.environment}"
    Environment = var.environment
  }
}

# Call logs bucket
resource "aws_s3_bucket" "call_logs" {
  bucket        = "rivvi-call-logs-${var.environment}"
  force_destroy = true

  tags = {
    Name        = "rivvi-call-logs-${var.environment}"
    Environment = var.environment
  }
}

# Lifecycle rules for call logs
resource "aws_s3_bucket_lifecycle_configuration" "call_logs" {
  bucket = aws_s3_bucket.call_logs.id

  rule {
    id     = "archive_logs"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }
}

# Bucket notifications for call logs processing
resource "aws_s3_bucket_notification" "call_logs" {
  bucket = aws_s3_bucket.call_logs.id

  lambda_function {
    lambda_function_arn = var.call_log_processor_lambda_arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "raw/"
  }
}
