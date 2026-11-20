
output "cluster_id" {
  description = "ECS cluster ID"
  value       = aws_ecs_cluster.main.id
}

output "cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "migration_task_definition_arn" {
  description = "Migration task definition ARN"
  value       = aws_ecs_task_definition.migration.arn
}

output "app_task_definition_arn" {
  description = "Application task definition ARN"
  value       = aws_ecs_task_definition.app.arn
}
