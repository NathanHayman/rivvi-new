# AWS Backup vault
resource "aws_backup_vault" "main" {
  name = "rivvi-backup-${var.environment}"
  kms_key_arn = var.kms_key_arn
}

# Backup plan for RDS
resource "aws_backup_plan" "rds" {
  name = "rivvi-rds-backup-${var.environment}"

  rule {
    rule_name         = "daily_backup"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 5 ? * * *)"  # Daily at 5 AM UTC

    lifecycle {
      delete_after = 30  # Keep backups for 30 days
    }

    copy_action {
      destination_vault_arn = var.dr_region_vault_arn
    }
  }

  rule {
    rule_name         = "weekly_backup"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 5 ? * 1 *)"  # Weekly on Sunday

    lifecycle {
      delete_after = 90  # Keep weekly backups for 90 days
    }

    copy_action {
      destination_vault_arn = var.dr_region_vault_arn
    }
  }
}

# S3 replication for critical buckets
resource "aws_s3_bucket_replication_configuration" "critical_data" {
  role   = aws_iam_role.replication.arn
  bucket = var.processed_data_bucket

  rule {
    id     = "critical-data-replication"
    status = "Enabled"

    destination {
      bucket        = var.dr_bucket_arn
      storage_class = "STANDARD_IA"
    }
  }
}