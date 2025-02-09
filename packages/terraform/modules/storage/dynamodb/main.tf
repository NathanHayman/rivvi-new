# Active Runs Table - Stores run metadata and status
resource "aws_dynamodb_table" "active_runs" {
  name           = "rivvi-active-runs-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "run_id"
  range_key      = "org_id"
  stream_enabled = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "run_id"
    type = "S"
  }

  attribute {
    name = "org_id"
    type = "S"
  }

  attribute {
    name = "campaign_id"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  global_secondary_index {
    name               = "org-campaign-index"
    hash_key           = "org_id"
    range_key          = "campaign_id"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "campaign-status-index"
    hash_key           = "campaign_id"
    range_key          = "status"
    projection_type    = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled       = true
  }

  tags = {
    Name        = "rivvi-active-runs-${var.environment}"
    Environment = var.environment
  }
}

# Run Data Table - Stores temporary run data
resource "aws_dynamodb_table" "run_data" {
  name           = "rivvi-run-data-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "run_id"
  range_key      = "row_id"
  stream_enabled = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "run_id"
    type = "S"
  }

  attribute {
    name = "row_id"
    type = "S"
  }

  attribute {
    name = "phone_number"
    type = "S"
  }

  global_secondary_index {
    name               = "phone-index"
    hash_key           = "phone_number"
    projection_type    = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled       = true
  }

  tags = {
    Name        = "rivvi-run-data-${var.environment}"
    Environment = var.environment
  }
}

# Active Calls Table - Tracks concurrent calls per org
resource "aws_dynamodb_table" "active_calls" {
  name           = "rivvi-active-calls-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "org_id"
  stream_enabled = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "org_id"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled       = true
  }

  tags = {
    Name        = "rivvi-active-calls-${var.environment}"
    Environment = var.environment
  }
}
