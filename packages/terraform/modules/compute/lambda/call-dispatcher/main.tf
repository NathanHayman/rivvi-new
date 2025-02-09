resource "aws_lambda_function" "call_dispatcher" {
  filename         = var.filename
  function_name    = "rivvi-call-dispatcher-${var.environment}"
  role            = var.role_arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 60
  memory_size     = 256

  environment {
    variables = {
      ACTIVE_RUNS_TABLE = var.active_runs_table
      RUN_DATA_TABLE = var.run_data_table
      ACTIVE_CALLS_TABLE = var.active_calls_table
      MAX_CONCURRENT_CALLS = "20"
    }
  }

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = var.security_group_ids
  }

  tags = {
    Name        = "rivvi-call-dispatcher-${var.environment}"
    Environment = var.environment
  }
}

# EventBridge trigger
resource "aws_cloudwatch_event_rule" "dispatcher" {
  name                = "call-dispatcher-${var.environment}"
  description         = "Trigger call dispatcher every 3 minutes"
  schedule_expression = "rate(3 minutes)"
}

resource "aws_cloudwatch_event_target" "dispatcher" {
  rule      = aws_cloudwatch_event_rule.dispatcher.name
  target_id = "CallDispatcher"
  arn       = aws_lambda_function.call_dispatcher.arn
}

resource "aws_lambda_permission" "eventbridge" {
  statement_id  = "AllowEventBridgeInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.call_dispatcher.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.dispatcher.arn
}
