
output "database_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.main.address
}

output "database_port" {
  description = "RDS PostgreSQL port"
  value       = aws_db_instance.main.port
}

output "database_name" {
  description = "Application database name"
  value       = aws_db_instance.main.db_name
}

output "admin_secret_arn" {
  description = "Secrets Manager ARN for RDS administrator credentials"
  value       = aws_db_instance.main.master_user_secret[0].secret_arn
}

output "app_secret_arn" {
  description = "Secrets Manager ARN for application credentials"
  value       = aws_secretsmanager_secret.app.arn
}
