
# Generate a password for the restricted application user.
resource "random_password" "app" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Store the application credentials in Secrets Manager.
resource "aws_secretsmanager_secret" "app" {
  name        = "${var.project_name}/database/app"
  description = "JobClose application database credentials"

  recovery_window_in_days = 0

  tags = {
    Name = "${var.project_name}-database-app-secret"
  }
}

resource "aws_secretsmanager_secret_version" "app" {
  secret_id = aws_secretsmanager_secret.app.id

  secret_string = jsonencode({
    username = "jobclose_app"
    password = random_password.app.result
  })
}

# Create a subnet group using the existing private subnets.
resource "aws_db_subnet_group" "main" {
  name        = "${var.project_name}-db-subnet-group"
  description = "Private subnets for the JobClose database"
  subnet_ids  = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# Create the PostgreSQL database.
resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-db"

  engine         = "postgres"
  instance_class = var.instance_class

  db_name  = var.database_name
  username = var.master_username

  manage_master_user_password = true

  allocated_storage = 20
  storage_type      = "gp3"
  storage_encrypted = true

  port = 5432

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.security_group_id]

  publicly_accessible = false
  multi_az            = false

  backup_retention_period    = 1
  auto_minor_version_upgrade = true

  deletion_protection      = false
  skip_final_snapshot      = true
  delete_automated_backups = true

  apply_immediately = true

  tags = {
    Name = "${var.project_name}-database"
  }

  depends_on = [
    aws_secretsmanager_secret_version.app
  ]
}
