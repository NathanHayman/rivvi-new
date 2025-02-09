resource "aws_lambda_function" "webhook_handler" {
  filename         = var.filename
  function_name    = "rivvi-webhook-handler-${var.environment}"
  role            = var.role_arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      CALL_LOGS_BUCKET = var.call_logs_bucket
      ACTIVE_RUNS_TABLE = var.active_runs_table
      RUN_DATA_TABLE = var.run_data_table
      BATCH_QUEUE_URL = var.batch_queue_url
    }
  }

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = var.security_group_ids
  }

  tags = {
    Name        = "rivvi-webhook-handler-${var.environment}"
    Environment = var.environment
  }
}

# API Gateway Permission
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.webhook_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/*"
}