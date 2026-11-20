
variable "project_name" {
  description = "Project name used for IAM resource naming"
  type        = string
}

variable "aws_region" {
  description = "AWS region where JobClose runs"
  type        = string
}

variable "aws_account_id" {
  description = "AWS account ID"
  type        = string
}

variable "github_repository" {
  description = "GitHub repository allowed to deploy JobClose"
  type        = string
}
