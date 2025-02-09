provider "aws" {
  region = var.region
}

# Import common configuration
module "common" {
  source = "../dev"

  environment = "production"
  region      = var.region
  vpc_cidr    = var.vpc_cidr
  
  private_subnet_cidrs = var.private_subnet_cidrs
  public_subnet_cidrs  = var.public_subnet_cidrs
  availability_zones   = var.availability_zones

  # Production-specific overrides
  rds_instance_class = "db.r6g.2xlarge"  # Larger instance for production
}

# Additional production-specific configurations
resource "aws_backup_vault" "main" {
  name = "rivvi-backup-vault-production"
  
  tags = {
    Environment = "production"
  }
}

resource "aws_backup_plan" "main" {
  name = "rivvi-backup-plan-production"

  rule {
    rule_name         = "daily_backup"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 5 ? * * *)"  # Daily at 5 AM UTC

    lifecycle {
      delete_after = 30  # Keep backups for 30 days
    }
  }

  tags = {
    Environment = "production"
  }
}
