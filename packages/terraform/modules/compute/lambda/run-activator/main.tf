resource "aws_lambda_function" "run_activator" {
  filename         = var.filename
  function_name    = "rivvi-run-activator-${var.environment}"
  role            = var.role_arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 300
  memory_size     = 512

  environment {
    variables = {
      PROCESSED_DATA_BUCKET = var.processed_data_bucket
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
}

# EventBridge rule for scheduled activation
resource "aws_cloudwatch_event_rule" "run_activation" {
  name                = "run-activation-${var.environment}"
  description         = "Check for scheduled runs"
  schedule_expression = "rate(1 minute)"
}

resource "aws_cloudwatch_event_target" "run_activation" {
  rule      = aws_cloudwatch_event_rule.run_activation.name
  target_id = "RunActivation"
  arn       = aws_lambda_function.run_activator.arn
}
