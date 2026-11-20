
output "load_balancer_dns_name" {
  description = "Public DNS name of the ALB"
  value       = aws_lb.main.dns_name
}

output "load_balancer_arn" {
  description = "ALB ARN"
  value       = aws_lb.main.arn
}

output "target_group_arn" {
  description = "ECS application target group ARN"
  value       = aws_lb_target_group.app.arn
}

output "certificate_arn" {
  description = "ACM certificate ARN"
  value       = aws_acm_certificate.main.arn
}

output "application_url" {
  description = "JobClose HTTPS application URL"
  value       = "https://${var.domain_name}"
}
