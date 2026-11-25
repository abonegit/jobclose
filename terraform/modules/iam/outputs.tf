
output "execution_role_arn" {
  description = "ARN of the ECS task execution role"
  value       = aws_iam_role.execution.arn
}

output "task_role_arn" {
  description = "ARN of the ECS application task role"
  value       = aws_iam_role.task.arn
}

output "github_actions_role_arn" {
  description = "IAM role assumed by GitHub Actions through OIDC"
  value       = aws_iam_role.github_actions.arn
}

output "github_actions_terraform_role_arn" {
  description = "ARN of the GitHub Actions Terraform infrastructure role"
  value       = aws_iam_role.github_actions_terraform.arn
}