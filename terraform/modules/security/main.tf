# Security group for the Application Load Balancer
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  description = "Allows public HTTP and HTTPS traffic to the ALB"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.project_name}-alb-sg"
  }
}

# Security group for ECS Fargate tasks
resource "aws_security_group" "ecs" {
  name        = "${var.project_name}-ecs-sg"
  description = "Allows application traffic from the ALB"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.project_name}-ecs-sg"
  }
}

# Security group for the RDS database
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Allows PostgreSQL traffic from ECS only"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

# ALB: allow HTTP from the internet
resource "aws_vpc_security_group_ingress_rule" "alb_http" {
  security_group_id = aws_security_group.alb.id
  description       = "Allow public HTTP traffic"
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 80
  cidr_ipv4         = "0.0.0.0/0"
}

# ALB: allow HTTPS from the internet
resource "aws_vpc_security_group_ingress_rule" "alb_https" {
  security_group_id = aws_security_group.alb.id
  description       = "Allow public HTTPS traffic"
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
  cidr_ipv4         = "0.0.0.0/0"
}

# ECS: allow application traffic from the ALB only
resource "aws_vpc_security_group_ingress_rule" "ecs_app" {
  security_group_id            = aws_security_group.ecs.id
  description                  = "Allow traffic from the ALB on port 3000"
  ip_protocol                  = "tcp"
  from_port                    = 3000
  to_port                      = 3000
  referenced_security_group_id = aws_security_group.alb.id
}

# RDS: allow PostgreSQL traffic from ECS only
resource "aws_vpc_security_group_ingress_rule" "rds_postgres" {
  security_group_id            = aws_security_group.rds.id
  description                  = "Allow PostgreSQL traffic from ECS"
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
  referenced_security_group_id = aws_security_group.ecs.id
}

# ALB: allow outbound application traffic to ECS
resource "aws_vpc_security_group_egress_rule" "alb_to_ecs" {
  security_group_id            = aws_security_group.alb.id
  description                  = "Forward traffic to ECS on port 3000"
  ip_protocol                  = "tcp"
  from_port                    = 3000
  to_port                      = 3000
  referenced_security_group_id = aws_security_group.ecs.id
}

# ECS: allow outbound PostgreSQL traffic to RDS
resource "aws_vpc_security_group_egress_rule" "ecs_to_rds" {
  security_group_id            = aws_security_group.ecs.id
  description                  = "Allow ECS to connect to PostgreSQL"
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
  referenced_security_group_id = aws_security_group.rds.id
}

# ECS: allow HTTPS access to AWS services
resource "aws_vpc_security_group_egress_rule" "ecs_https" {
  security_group_id = aws_security_group.ecs.id
  description       = "Allow HTTPS access to AWS services"
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
  cidr_ipv4         = "0.0.0.0/0"
}