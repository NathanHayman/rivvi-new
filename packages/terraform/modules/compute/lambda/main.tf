resource "aws_lambda_function" "lambda" {
  filename         = var.filename
  function_name    = var.function_name
  role            = var.role_arn
  handler         = var.handler
  source_code_hash = var.source_code_hash
  runtime         = var.runtime

  memory_size = var.memory_size
  timeout     = var.timeout

  environment {
    variables = var.environment_variables
  }

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = var.security_group_ids
  }

  tags = {
    Name = var.function_name
  }
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = 14
}
