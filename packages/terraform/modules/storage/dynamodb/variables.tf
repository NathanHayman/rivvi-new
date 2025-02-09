variable "table_name" {
  description = "Name of the DynamoDB table"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
}

variable "hash_key" {
  description = "Hash key for the table"
  type        = string
}

variable "range_key" {
  description = "Range key for the table"
  type        = string
  default     = null
}

variable "attributes" {
  description = "List of attributes for the table"
  type = list(object({
    name = string
    type = string
  }))
}

variable "kms_key_arn" {
  description = "ARN of the KMS key for encryption"
  type        = string
}
