resource "aws_wafv2_web_acl" "main" {
  name        = "rivvi-waf-${var.environment}"
  description = "WAF rules for Rivvi API"
  scope       = "REGIONAL"

  default_action {
    allow {}
  }

  # Rate limiting rule
  rule {
    name     = "RateLimit"
    priority = 1

    override_action {
      none {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "RateLimitRule"
      sampled_requests_enabled  = true
    }
  }

  # Filter known bad IP addresses
  rule {
    name     = "BlockBadIPs"
    priority = 2

    override_action {
      none {}
    }

    statement {
      ip_set_reference_statement {
        arn = aws_wafv2_ip_set.bad_ips.arn
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "BlockBadIPsRule"
      sampled_requests_enabled  = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name               = "RivviWAFACL"
    sampled_requests_enabled  = true
  }

  tags = {
    Name        = "rivvi-waf-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_wafv2_ip_set" "bad_ips" {
  name               = "rivvi-bad-ips-${var.environment}"
  description        = "IP addresses to block"
  scope              = "REGIONAL"
  ip_address_version = "IPV4"
  addresses          = []  # Empty by default, can be updated via AWS Console

  tags = {
    Name        = "rivvi-bad-ips-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_wafv2_web_acl_association" "api_gateway" {
  resource_arn = var.api_gateway_arn
  web_acl_arn  = aws_wafv2_web_acl.main.arn
}
