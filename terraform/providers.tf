provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "JobClose"
      Environment = "Portfolio"
      ManagedBy   = "Terraform"
    }
  }
}
