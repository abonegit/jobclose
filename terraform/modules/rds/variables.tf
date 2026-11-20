
variable "project_name" {
  description = "Project name used for RDS resources"
  type        = string
}

variable "database_name" {
  description = "Name of the application database"
  type        = string
  default     = "jobclose"
}

variable "master_username" {
  description = "RDS administrator username"
  type        = string
  default     = "jobclose_admin"
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for the RDS subnet group"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID allowing ECS database access"
  type        = string
}

variable "instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}
