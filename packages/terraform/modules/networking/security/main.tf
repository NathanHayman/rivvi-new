resource "aws_security_group" "lambda" {
  name        = "rivvi-lambda-${var.environment}"
  description = "Security group for Lambda functions"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "rivvi-lambda-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_security_group" "rds" {
  name        = "rivvi-rds-${var.environment}"
  description = "Security group for RDS cluster"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
  }

  tags = {
    Name        = "rivvi-rds-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_security_group" "endpoints" {
  name        = "rivvi-endpoints-${var.environment}"
  description = "Security group for VPC endpoints"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
  }

  tags = {
    Name        = "rivvi-endpoints-${var.environment}"
    Environment = var.environment
  }
}
