variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the RDS cluster"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID for the RDS cluster"
  type        = string
}

variable "kms_key_id" {
  description = "KMS key ID for RDS encryption"
  type        = string
}

variable "engine_version" {
  description = "Aurora PostgreSQL engine version"
  type        = string
  default     = "15.3"
}

variable "master_username" {
  description = "Master username for the RDS cluster"
  type        = string
  default     = "rivvi_admin"
}

variable "instance_count" {
  description = "Number of RDS instances in the cluster"
  type        = number
  default     = 2
}

variable "instance_class" {
  description = "Instance class for RDS instances"
  type        = string
  default     = "db.r6g.large"
}
