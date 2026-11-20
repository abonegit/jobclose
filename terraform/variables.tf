variable "aws_region" {
  description = "AWS region for JobClose infrastructure"
  type        = string
  default     = "eu-west-2"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "jobclose"
}

variable "domain_name" {
  description = "Existing Route 53 domain name"
  type        = string
  default     = "abdulmalikisah.co.uk"
}

variable "github_repository" {
  description = "GitHub repository allowed to deploy JobClose"
  type        = string
  default     = "abonegit/jobclose"
}
