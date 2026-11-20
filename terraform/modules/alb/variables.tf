
variable "project_name" {
  description = "Project name"
  type        = string
}

variable "domain_name" {
  description = "Application domain name"
  type        = string
}

variable "hosted_zone_name" {
  description = "Existing Route 53 hosted zone name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID for the load balancer"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs for the load balancer"
  type        = list(string)
}

variable "security_group_id" {
  description = "ALB security group ID"
  type        = string
}
