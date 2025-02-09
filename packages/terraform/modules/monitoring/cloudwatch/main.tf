# Dashboard for operational metrics
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "rivvi-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["Rivvi/Calls", "ConcurrentCalls", "OrgId", "*"],
            [".", "FailedCalls", ".", "."],
            [".", "SuccessfulCalls", ".", "."]
          ]
          period = 300
          stat   = "Sum"
          region = var.region
          title  = "Call Statistics"
        }
      }
    ]
  })
}
