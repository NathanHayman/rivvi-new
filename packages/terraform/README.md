# RIVVI INFRASTRUCTURE COMPLETE SPECIFICATION

## 1. Core System Design

### Organization & Campaign Structure

```plaintext
Organization
  └── Campaigns (predefined, org-specific)
       └── Runs (executions of campaigns)
            └── Calls (max 20 concurrent per org)
```

### Key System Rules

- One active campaign per organization
- 20 concurrent calls per organization limit
- Runs can be created/scheduled but data stays in S3 until active
- Call logs stored in S3, real-time data in DynamoDB
- Post-run data synced to RDS with deduplication

## 2. Storage Architecture

### S3 Buckets

```plaintext
rivvi-storage/
├── raw-uploads/
│   └── {orgId}/{campaignId}/{runId}/{timestamp}.xlsx
├── processed-data/
│   └── {orgId}/{campaignId}/{runId}/
│       ├── data.json
│       └── validation-results.json
└── call-logs/
    └── {orgId}/{runId}/
        ├── raw/
        │   └── {callId}-webhook.json
        └── processed/
            └── {callId}-formatted.json
```

### DynamoDB Tables

#### active_runs

```json
{
  "run_id": "string (PK)",
  "org_id": "string (SK)",
  "campaign_id": "string",
  "status": "string",
  "active_calls": "number",
  "processed_file_url": "string",
  "GSI1PK": "org_id",
  "GSI1SK": "status",
  "TTL": "number (7 days)"
}
```

#### run_data

```json
{
  "run_id": "string (PK)",
  "row_id": "string (SK)",
  "patient_data": {
    "first_name": "string",
    "last_name": "string",
    "phone": "string",
    "dob": "string"
  },
  "campaign_data": "map (campaign-specific fields)",
  "call_status": "string",
  "call_id": "string (optional)",
  "TTL": "number (7 days)"
}
```

### RDS Schema

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    outbound_phone TEXT NOT NULL,
    timezone TEXT NOT NULL,
    office_hours JSONB,
    concurrent_call_limit INTEGER DEFAULT 20
);

CREATE TABLE campaigns (
    id UUID PRIMARY KEY,
    org_id UUID REFERENCES organizations(id),
    name TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    required_fields JSONB,
    campaign_variables JSONB,
    validation_rules JSONB
);

CREATE TABLE runs (
    id UUID PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id),
    status TEXT NOT NULL,
    raw_file_url TEXT,
    processed_file_url TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    total_records INTEGER,
    processed_records INTEGER
);

CREATE TABLE patients (
    id UUID PRIMARY KEY,
    org_id UUID REFERENCES organizations(id),
    first_name TEXT,
    last_name TEXT,
    dob DATE,
    phone TEXT,
    patient_hash TEXT UNIQUE
);

CREATE TABLE calls (
    id UUID PRIMARY KEY,
    run_id UUID REFERENCES runs(id),
    patient_id UUID REFERENCES patients(id),
    call_log_url TEXT,
    status TEXT,
    created_at TIMESTAMP
);

-- Add inbound call tracking
ALTER TABLE calls
ADD COLUMN direction TEXT CHECK (direction IN ('inbound', 'outbound')),
ADD COLUMN callback_for UUID REFERENCES calls(id);

-- Add campaign context
CREATE TABLE campaign_contexts (
    id UUID PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id),
    patient_id UUID REFERENCES patients(id),
    context_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);
```

## 3. Lambda Functions

### `run-processor`

- **Trigger**: S3 upload (raw-uploads bucket)
- **Actions**:
  - Clean/validate data
  - Store processed data in S3
  - Update run status

### `run-activator`

- **Trigger**: API Gateway (manual) or EventBridge (scheduled)
- **Actions**:
  - Check org's active runs
  - Load processed S3 data to DynamoDB
  - Initialize call dispatcher

### `call-dispatcher`

- **Trigger**: EventBridge (every 3 minutes)
- **Actions**:

  - Check org's concurrent call count
  - Fetch next batch (max 20 - active_calls)
  - Dispatch via RetellAI with:

    ```typescript
    {
      from_number: string,      // from org
      to_number: string,        // from run data
      override_agent_id: string, // from campaign
      retell_llm_dynamic_variables: {
        // Global variables
        first_name: string,
        last_name: string,
        dob: string,
        is_minor: string,
        phone: string,

        // Campaign-specific variables
        [key: string]: string
      },
      metadata: {
        run_id: string,
        row_id: string,
        org_id: string,
        campaign_id: string
      }
    }
    ```

### `webhook-handler`

- **Trigger**: API Gateway
- **Actions**:
  - Filter for type="call_analyzed"
  - Store raw payload in S3
  - Trigger webhook-processor

### `webhook-processor`

- **Trigger**: S3 (call-logs/raw)
- **Actions**:
  - Parse webhook data
  - Update DynamoDB run_data
  - Check run completion

### `run-completer`

- **Trigger**: SQS (when run completes)
- **Actions**:
  - Generate patient hashes
  - Deduplicate patients into RDS
  - Store call records
  - Clean up DynamoDB

## 4. EventBridge Rules

```hcl
resource "aws_cloudwatch_event_rule" "call_dispatcher" {
  name                = "call-dispatcher"
  schedule_expression = "rate(3 minutes)"
}

resource "aws_cloudwatch_event_rule" "run_scheduler" {
  name                = "run-scheduler"
  schedule_expression = "rate(1 minute)"
}
```

Continuing with the complete infrastructure specification...

## 5. VPC Configuration

### Network Layout

```hcl
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "rivvi-vpc"
  }
}

# Private Subnets (for RDS, Lambda)
resource "aws_subnet" "private" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 4, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "rivvi-private-${count.index + 1}"
  }
}

# Public Subnets (for NAT Gateway)
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 4, count.index + 3)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  map_public_ip_on_launch = true

  tags = {
    Name = "rivvi-public-${count.index + 1}"
  }
}
```

### VPC Endpoints

```hcl
resource "aws_vpc_endpoint" "s3" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${var.region}.s3"

  route_table_ids = aws_route_table.private[*].id
}

resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${var.region}.dynamodb"

  route_table_ids = aws_route_table.private[*].id
}

resource "aws_vpc_endpoint" "events" {
  vpc_id             = aws_vpc.main.id
  service_name       = "com.amazonaws.${var.region}.events"
  vpc_endpoint_type  = "Interface"
  subnet_ids         = aws_subnet.private[*].id
  security_group_ids = [aws_security_group.vpc_endpoints.id]
}
```

## 6. Security Groups

### Lambda Function Security

```hcl
resource "aws_security_group" "lambda" {
  name_prefix = "lambda-sg"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

### RDS Security

```hcl
resource "aws_security_group" "rds" {
  name_prefix = "rds-sg"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
  }
}
```

### VPC Endpoints Security

```hcl
resource "aws_security_group" "vpc_endpoints" {
  name_prefix = "vpc-endpoints-sg"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
  }
}
```

## 7. IAM Roles & Policies

### Lambda Base Role

```hcl
resource "aws_iam_role" "lambda_base" {
  name = "lambda-base-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}
```

### Lambda Policies

```hcl
resource "aws_iam_role_policy" "lambda_s3" {
  name = "lambda-s3-policy"
  role = aws_iam_role.lambda_base.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject"
        ]
        Resource = [
          "${aws_s3_bucket.raw_uploads.arn}/*",
          "${aws_s3_bucket.processed_data.arn}/*",
          "${aws_s3_bucket.call_logs.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "lambda-dynamodb-policy"
  role = aws_iam_role.lambda_base.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.active_runs.arn,
          aws_dynamodb_table.run_data.arn
        ]
      }
    ]
  })
}
```

## 8. Monitoring & Alerting

### CloudWatch Metrics

```hcl
resource "aws_cloudwatch_metric_alarm" "concurrent_calls" {
  alarm_name          = "concurrent-calls-exceeded"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "ActiveCalls"
  namespace           = "Rivvi/Calls"
  period              = "60"
  statistic           = "Maximum"
  threshold           = "20"
  alarm_description   = "Concurrent calls exceeded limit"
  alarm_actions      = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "webhook_errors" {
  alarm_name          = "webhook-processing-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "5"
  metric_name         = "WebhookErrors"
  namespace           = "Rivvi/Webhooks"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "High number of webhook processing errors"
  alarm_actions      = [aws_sns_topic.alerts.arn]
}
```

### Log Groups

```hcl
resource "aws_cloudwatch_log_group" "lambda_logs" {
  for_each          = toset(["run-processor", "run-activator", "call-dispatcher", "webhook-handler", "webhook-processor", "run-completer"])
  name              = "/aws/lambda/${each.key}"
  retention_in_days = 30
}
```

## 9. Cost Optimization

### DynamoDB Auto Scaling

```hcl
resource "aws_appautoscaling_target" "dynamodb_table_read_target" {
  max_capacity       = 100
  min_capacity       = 5
  resource_id        = "table/${aws_dynamodb_table.run_data.name}"
  scalable_dimension = "dynamodb:table:ReadCapacityUnits"
  service_namespace  = "dynamodb"
}

resource "aws_appautoscaling_policy" "dynamodb_table_read_policy" {
  name               = "DynamoDBReadCapacityUtilization"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.dynamodb_table_read_target.resource_id
  scalable_dimension = aws_appautoscaling_target.dynamodb_table_read_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.dynamodb_table_read_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "DynamoDBReadCapacityUtilization"
    }
    target_value = 70.0
  }
}
```

## 10. Backup & Disaster Recovery

### S3 Lifecycle Rules

```hcl
resource "aws_s3_bucket_lifecycle_configuration" "bucket_lifecycle" {
  bucket = aws_s3_bucket.call_logs.id

  rule {
    id     = "archive_old_logs"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }
}
```

### RDS Backup

```hcl
resource "aws_db_instance" "main" {
  # ... other configurations ...

  backup_retention_period = 30
  backup_window          = "03:00-04:00"

  copy_tags_to_snapshot = true

  enabled_cloudwatch_logs_exports = ["postgresql"]
}
```

## 11. Deployment Pipeline

### CodePipeline Configuration

```hcl
resource "aws_codepipeline" "main" {
  name     = "rivvi-pipeline"
  role_arn = aws_iam_role.codepipeline_role.arn

  artifact_store {
    location = aws_s3_bucket.artifacts.bucket
    type     = "S3"
  }

  stage {
    name = "Source"
    # ... source configuration ...
  }

  stage {
    name = "Build"
    # ... build configuration ...
  }

  stage {
    name = "Deploy"
    # ... deployment configuration ...
  }
}
```
