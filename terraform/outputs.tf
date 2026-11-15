output "vpc_id" {
  description = "JobClose VPC ID"
  value       = module.networking.vpc_id
}

output "public_subnet_ids" {
  description = "JobClose public subnet IDs"
  value       = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  description = "JobClose private subnet IDs"
  value       = module.networking.private_subnet_ids
}
output "alb_security_group_id" {
  value = module.security.alb_security_group_id
}

output "ecs_security_group_id" {
  value = module.security.ecs_security_group_id
}

output "rds_security_group_id" {
  value = module.security.rds_security_group_id
}

output "ecr_repository_name" {
  description = "JobClose ECR repository name"
  value       = module.ecr.repository_name
}

output "ecr_repository_url" {
  description = "JobClose ECR repository URL"
  value       = module.ecr.repository_url
}