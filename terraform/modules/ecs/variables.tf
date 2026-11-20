
variable "project_name" {
  description = "Project name"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "image_url" {
  description = "Full ECR image URL including tag"
  type        = string
}

variable "execution_role_arn" {
  description = "ECS task execution role ARN"
  type        = string
}

variable "task_role_arn" {
  description = "ECS application task role ARN"
  type        = string
}

variable "ecs_security_group_id" {
  description = "Security group assigned to ECS tasks"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs used by Fargate tasks"
  type        = list(string)
}

variable "database_endpoint" {
  description = "RDS database endpoint"
  type        = string
}

variable "database_name" {
  description = "Database name"
  type        = string
}

variable "admin_secret_arn" {
  description = "RDS administrator secret ARN"
  type        = string
}

variable "app_secret_arn" {
  description = "Application database credentials secret ARN"
  type        = string
}

variable "desired_count" {
  description = "Number of application tasks"
  type        = number
  default     = 1
}

variable "target_group_arn" {
  description = "ARN of the Application Load Balancer target group"
  type        = string
}