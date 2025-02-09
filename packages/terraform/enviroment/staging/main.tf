provider "aws" {
  region = var.region
}

module "common" {
  source = "../dev"

  environment = "staging"
  region      = var.region
  vpc_cidr    = var.vpc_cidr

  private_subnet_cidrs = var.private_subnet_cidrs
  public_subnet_cidrs  = var.public_subnet_cidrs
  availability_zones   = var.availability_zones

  rds_config = {
    instance_class = "db.r6g.xlarge"
  }
}
