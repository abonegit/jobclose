
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