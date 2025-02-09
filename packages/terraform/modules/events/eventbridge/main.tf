# Run Scheduler Rule
resource "aws_cloudwatch_event_rule" "run_scheduler" {
  name                = "rivvi-run-scheduler-${var.environment}"
  description         = "Check for scheduled runs every minute"
  schedule_expression = "rate(1 minute)"

  tags = {
    Name        = "rivvi-run-scheduler-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_event_target" "run_scheduler" {
  rule      = aws_cloudwatch_event_rule.run_scheduler.name
  target_id = "RunScheduler"
  arn       = var.run_activator_lambda_arn

  input_transformer {
    input_paths = {
      time = "$.time"
    }
    input_template = <<EOF
{
  "time": <time>,
  "environment": "${var.environment}"
}
EOF
  }
}
