resource "aws_lambda_function" "inbound_handler" {
  filename         = var.filename
  function_name    = "rivvi-inbound-handler-${var.environment}"
  role            = var.role_arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 10
  memory_size     = 256

  environment {
    variables = {
      ACTIVE_RUNS_TABLE = var.active_runs_table
      INBOUND_CONTEXT_TABLE = var.inbound_context_table
      RDS_SECRET_ARN = var.rds_secret_arn
      RDS_CLUSTER_ARN = var.rds_cluster_arn
    }
  }

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = var.security_group_ids
  }

  tags = {
    Name        = "rivvi-inbound-handler-${var.environment}"
    Environment = var.environment
  }
}

# API Gateway Integration
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.inbound_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/*"
}
