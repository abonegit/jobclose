terraform {
  backend "s3" {
    bucket       = "jobclose-terraform-state"
    key          = "jobclose/terraform.tfstate"
    region       = "eu-west-2"
    encrypt      = true
    use_lockfile = true
  }
}