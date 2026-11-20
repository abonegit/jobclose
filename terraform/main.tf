
module "networking" {
  source = "./modules/networking"

  project_name = var.project_name
  vpc_cidr     = "10.0.0.0/16"
}


module "security" {
  source = "./modules/security"

  project_name = var.project_name
  vpc_id       = module.networking.vpc_id
}

module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
}


module "iam" {
  source = "./modules/iam"

  project_name      = var.project_name
  aws_region        = var.aws_region
  aws_account_id    = "564343772779"
  github_repository = "abonegit/jobclose"
}


module "rds" {
  source = "./modules/rds"

  project_name = var.project_name

  database_name   = "jobclose"
  master_username = "jobclose_admin"
  instance_class  = "db.t4g.micro"

  private_subnet_ids = module.networking.private_subnet_ids
  security_group_id  = module.security.rds_security_group_id
}


module "ecs" {
  source = "./modules/ecs"

  project_name = var.project_name
  aws_region   = var.aws_region

  image_url = "564343772779.dkr.ecr.eu-west-2.amazonaws.com/jobclose:4296a67b6a21"

  execution_role_arn = module.iam.execution_role_arn
  task_role_arn      = module.iam.task_role_arn

  ecs_security_group_id = module.security.ecs_security_group_id
  public_subnet_ids     = module.networking.public_subnet_ids

  database_endpoint = module.rds.database_endpoint
  database_name     = module.rds.database_name

  admin_secret_arn = module.rds.admin_secret_arn
  app_secret_arn   = module.rds.app_secret_arn
  target_group_arn = module.alb.target_group_arn
}


module "alb" {
  source = "./modules/alb"

  project_name = var.project_name

  domain_name      = "tm.${var.domain_name}"
  hosted_zone_name = var.domain_name

  vpc_id            = module.networking.vpc_id
  public_subnet_ids = module.networking.public_subnet_ids
  security_group_id = module.security.alb_security_group_id
}