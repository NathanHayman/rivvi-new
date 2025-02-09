variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
}

variable "bucket_type" {
  description = "Type of bucket (raw_data, processed_data, call_logs)"
  type        = string
  validation {
    condition     = contains(["raw_data", "processed_data", "call_logs"], var.bucket_type)
    error_message = "bucket_type must be one of: raw_data, processed_data, call_logs"
  }
}

variable "kms_key_id" {
  description = "KMS key ID for bucket encryption"
  type        = string
}

variable "enable_versioning" {
  description = "Enable versioning on the bucket"
  type        = bool
  default     = true
}
