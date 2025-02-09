resource "aws_api_gateway_rest_api" "main" {
  name        = "rivvi-api-${var.environment}"
  description = "Rivvi API Gateway"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name        = "rivvi-api-${var.environment}"
    Environment = var.environment
  }
}

# Webhooks Resource
resource "aws_api_gateway_resource" "webhooks" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "webhooks"
}

resource "aws_api_gateway_resource" "calls" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.webhooks.id
  path_part   = "calls"
}

# Webhook POST Method
resource "aws_api_gateway_method" "webhook_post" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.calls.id
  http_method   = "POST"
  authorization = "NONE"

  request_validator_id = aws_api_gateway_request_validator.webhook.id
  
  request_models = {
    "application/json" = aws_api_gateway_model.webhook_request.name
  }
}

# Webhook Integration
resource "aws_api_gateway_integration" "webhook_lambda" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.calls.id
  http_method = aws_api_gateway_method.webhook_post.http_method
  
  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = var.webhook_lambda_invoke_arn
}

# Inbound Resource
resource "aws_api_gateway_resource" "inbound" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "inbound"
}

# Inbound POST Method
resource "aws_api_gateway_method" "inbound_post" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.inbound.id
  http_method   = "POST"
  authorization = "NONE"

  request_validator_id = aws_api_gateway_request_validator.inbound.id
  
  request_models = {
    "application/json" = aws_api_gateway_model.inbound_request.name
  }
}

# Inbound Integration
resource "aws_api_gateway_integration" "inbound_lambda" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.inbound.id
  http_method = aws_api_gateway_method.inbound_post.http_method
  
  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = var.inbound_lambda_invoke_arn
}

# Request Validators
resource "aws_api_gateway_request_validator" "webhook" {
  name                        = "webhook-validator"
  rest_api_id                = aws_api_gateway_rest_api.main.id
  validate_request_body      = true
  validate_request_parameters = true
}

resource "aws_api_gateway_request_validator" "inbound" {
  name                        = "inbound-validator"
  rest_api_id                = aws_api_gateway_rest_api.main.id
  validate_request_body      = true
  validate_request_parameters = true
}

# Models
resource "aws_api_gateway_model" "webhook_request" {
  rest_api_id  = aws_api_gateway_rest_api.main.id
  name         = "WebhookRequest"
  description  = "Webhook request model"
  content_type = "application/json"

  schema = jsonencode({
    type = "object"
    required = ["type"]
    properties = {
      type = {
        type = "string"
        enum = ["call_analyzed"]
      }
      direction = {
        type = "string"
        enum = ["inbound", "outbound"]
      }
      metadata = {
        type = "object"
        properties = {
          run_id = { type = "string" }
          row_id = { type = "string" }
          org_id = { type = "string" }
          campaign_id = { type = "string" }
        }
      }
    }
  })
}

resource "aws_api_gateway_model" "inbound_request" {
  rest_api_id  = aws_api_gateway_rest_api.main.id
  name         = "InboundRequest"
  description  = "Inbound request model"
  content_type = "application/json"

  schema = jsonencode({
    type = "object"
    required = ["from_number", "to_number"]
    properties = {
      llm_id = { type = "string" }
      from_number = {
        type = "string"
        pattern = "^\\+[1-9]\\d{1,14}$"
      }
      to_number = {
        type = "string"
        pattern = "^\\+[1-9]\\d{1,14}$"
      }
    }
  })
}

# Deployment & Stage
resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  depends_on = [
    aws_api_gateway_integration.webhook_lambda,
    aws_api_gateway_integration.inbound_lambda
  ]

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "main" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id  = aws_api_gateway_rest_api.main.id
  stage_name   = var.environment

  xray_tracing_enabled = true

  access_log_settings {
    destination_arn = var.cloudwatch_log_group_arn
    format         = jsonencode({
      requestId               = "$context.requestId"
      sourceIp               = "$context.identity.sourceIp"
      requestTime            = "$context.requestTime"
      protocol              = "$context.protocol"
      httpMethod            = "$context.httpMethod"
      resourcePath          = "$context.resourcePath"
      routeKey              = "$context.routeKey"
      status                = "$context.status"
      responseLength        = "$context.responseLength"
      integrationError      = "$context.integration.error"
      integrationStatus     = "$context.integration.status"
      integrationLatency    = "$context.integration.latency"
      integrationRequestId  = "$context.integration.requestId"
    })
  }
}