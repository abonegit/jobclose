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


output "database_endpoint" {
  description = "JobClose RDS database endpoint"
  value       = module.rds.database_endpoint
}

output "database_name" {
  description = "JobClose database name"
  value       = module.rds.database_name
}


output "ecs_execution_role_arn" {
  description = "IAM role used by ECS to pull images and retrieve secrets"
  value       = module.iam.execution_role_arn
}

output "ecs_task_role_arn" {
  description = "IAM role assigned to the JobClose application"
  value       = module.iam.task_role_arn
}


output "ecs_cluster_name" {
  description = "JobClose ECS cluster name"
  value       = module.ecs.cluster_name
}

output "migration_task_definition_arn" {
  description = "JobClose migration task definition"
  value       = module.ecs.migration_task_definition_arn
}

output "app_task_definition_arn" {
  description = "JobClose application task definition"
  value       = module.ecs.app_task_definition_arn
}


output "application_url" {
  description = "JobClose application HTTPS URL"
  value       = module.alb.application_url
}

output "load_balancer_dns_name" {
  description = "JobClose ALB DNS name"
  value       = module.alb.load_balancer_dns_name
}

output "target_group_arn" {
  description = "JobClose ALB target group ARN"
  value       = module.alb.target_group_arn
}

output "github_actions_role_arn" {
  description = "IAM role assumed by GitHub Actions through OIDC"
  value       = module.iam.github_actions_role_arn
}
