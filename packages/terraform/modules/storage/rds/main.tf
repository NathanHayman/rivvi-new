resource "aws_db_subnet_group" "main" {
  name        = "rivvi-${var.environment}"
  description = "Subnet group for Rivvi RDS cluster"
  subnet_ids  = var.subnet_ids

  tags = {
    Name        = "rivvi-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_rds_cluster" "main" {
  cluster_identifier     = "rivvi-${var.environment}"
  engine                = "aurora-postgresql"
  engine_version        = var.engine_version
  database_name         = "rivvi"
  master_username       = var.master_username
  manage_master_user_password = true
  
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.security_group_id]
  
  storage_encrypted     = true
  kms_key_id           = var.kms_key_id
  
  backup_retention_period = 7
  preferred_backup_window = "03:00-04:00"
  
  enabled_cloudwatch_logs_exports = ["postgresql"]
  
  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier = "rivvi-${var.environment}-final-snapshot"

  # Schema initialization script
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.main.name

  tags = {
    Name        = "rivvi-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_rds_cluster_parameter_group" "main" {
  family = "aurora-postgresql15"
  name   = "rivvi-${var.environment}"

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  parameter {
    name  = "log_statement"
    value = "all"
  }
}

# Schema initialization Lambda
resource "aws_lambda_function" "schema_init" {
  filename         = "${path.module}/schema.zip"
  function_name    = "rivvi-schema-init-${var.environment}"
  role            = var.lambda_role_arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 300

  environment {
    variables = {
      DB_SECRET_ARN = aws_rds_cluster.main.master_user_secret[0].secret_arn
      DB_CLUSTER_ARN = aws_rds_cluster.main.arn
    }
  }

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [var.security_group_id]
  }
}

# Schema SQL file
locals {
  schema_sql = <<-EOT
    -- Organizations table
    CREATE TABLE IF NOT EXISTS organizations (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      outbound_phone TEXT NOT NULL,
      timezone TEXT NOT NULL,
      office_hours JSONB,
      concurrent_call_limit INTEGER DEFAULT 20,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Campaigns table
    CREATE TABLE IF NOT EXISTS campaigns (
      id UUID PRIMARY KEY,
      org_id UUID REFERENCES organizations(id),
      name TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      required_fields JSONB NOT NULL,
      campaign_variables JSONB NOT NULL,
      validation_rules JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Runs table
    CREATE TABLE IF NOT EXISTS runs (
      id UUID PRIMARY KEY,
      campaign_id UUID REFERENCES campaigns(id),
      status TEXT NOT NULL,
      raw_file_url TEXT,
      processed_file_url TEXT,
      start_time TIMESTAMP WITH TIME ZONE,
      end_time TIMESTAMP WITH TIME ZONE,
      total_records INTEGER,
      processed_records INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Patients table with deduplication
    CREATE TABLE IF NOT EXISTS patients (
      id UUID PRIMARY KEY,
      org_id UUID REFERENCES organizations(id),
      patient_hash TEXT UNIQUE NOT NULL,
      first_name TEXT,
      last_name TEXT,
      dob DATE,
      phone TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Calls table with inbound tracking
    CREATE TABLE IF NOT EXISTS calls (
      id UUID PRIMARY KEY,
      run_id UUID REFERENCES runs(id),
      patient_id UUID REFERENCES patients(id),
      direction TEXT CHECK (direction IN ('inbound', 'outbound')),
      status TEXT NOT NULL,
      call_log_url TEXT,
      webhook_data JSONB,
      callback_for UUID REFERENCES calls(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Campaign context for inbound calls
    CREATE TABLE IF NOT EXISTS campaign_contexts (
      id UUID PRIMARY KEY,
      campaign_id UUID REFERENCES campaigns(id),
      patient_id UUID REFERENCES patients(id),
      context_data JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      expires_at TIMESTAMP WITH TIME ZONE,
      UNIQUE(campaign_id, patient_id)
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
    CREATE INDEX IF NOT EXISTS idx_calls_patient_id ON calls(patient_id);
    CREATE INDEX IF NOT EXISTS idx_calls_run_id ON calls(run_id);
    CREATE INDEX IF NOT EXISTS idx_campaign_contexts_patient ON campaign_contexts(patient_id);
  EOT
}

resource "local_file" "schema" {
  content  = local.schema_sql
  filename = "${path.module}/schema.sql"
}

data "archive_file" "schema" {
  type        = "zip"
  source_file = local_file.schema.filename
  output_path = "${path.module}/schema.zip"
}
