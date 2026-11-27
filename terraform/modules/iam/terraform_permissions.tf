# Permissions for Terraform to manage JobClose networking
# and security groups. IAM administration is deliberately excluded.

resource "aws_iam_role_policy" "terraform_networking" {
  name = "${var.project_name}-terraform-networking"
  role = aws_iam_role.github_actions_terraform.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid    = "DescribeNetworkingResources"
        Effect = "Allow"

        Action = [
          "ec2:DescribeAvailabilityZones",
          "ec2:DescribeVpcs",
          "ec2:DescribeVpcAttribute",
          "ec2:DescribeInternetGateways",
          "ec2:DescribeSubnets",
          "ec2:DescribeRouteTables",
          "ec2:DescribeSecurityGroups",
          "ec2:DescribeSecurityGroupRules",
          "ec2:DescribeTags"
        ]

        Resource = "*"
      },
      {
        Sid    = "ManageVpcAndSubnets"
        Effect = "Allow"

        Action = [
          "ec2:CreateVpc",
          "ec2:DeleteVpc",
          "ec2:ModifyVpcAttribute",
          "ec2:CreateInternetGateway",
          "ec2:AttachInternetGateway",
          "ec2:DetachInternetGateway",
          "ec2:DeleteInternetGateway",
          "ec2:CreateSubnet",
          "ec2:DeleteSubnet",
          "ec2:ModifySubnetAttribute"
        ]

        Resource = "*"
      },
      {
        Sid    = "ManageRoutes"
        Effect = "Allow"

        Action = [
          "ec2:CreateRouteTable",
          "ec2:DeleteRouteTable",
          "ec2:AssociateRouteTable",
          "ec2:DisassociateRouteTable",
          "ec2:CreateRoute",
          "ec2:DeleteRoute"
        ]

        Resource = "*"
      },
      {
        Sid    = "ManageSecurityGroups"
        Effect = "Allow"

        Action = [
          "ec2:CreateSecurityGroup",
          "ec2:DeleteSecurityGroup",
          "ec2:AuthorizeSecurityGroupIngress",
          "ec2:RevokeSecurityGroupIngress",
          "ec2:AuthorizeSecurityGroupEgress",
          "ec2:RevokeSecurityGroupEgress"
        ]

        Resource = "*"
      },
      {
        Sid    = "ManageNetworkingTags"
        Effect = "Allow"

        Action = [
          "ec2:CreateTags",
          "ec2:DeleteTags"
        ]

        Resource = "*"
      }
    ]
  })
}

# Permissions for Terraform to manage JobClose ECS and CloudWatch Logs.

resource "aws_iam_role_policy" "terraform_ecs" {
  name = "${var.project_name}-terraform-ecs"
  role = aws_iam_role.github_actions_terraform.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid    = "ManageECS"
        Effect = "Allow"

        Action = [
          "ecs:DescribeClusters",
          "ecs:DescribeServices",
          "ecs:DescribeTaskDefinition",
          "ecs:ListTaskDefinitions",
          "ecs:CreateCluster",
          "ecs:DeleteCluster",
          "ecs:RegisterTaskDefinition",
          "ecs:DeregisterTaskDefinition",
          "ecs:CreateService",
          "ecs:UpdateService",
          "ecs:DeleteService",
          "ecs:TagResource",
          "ecs:UntagResource",
          "ecs:ListTagsForResource"
        ]

        Resource = "*"
      },
      {
        Sid    = "PassOnlyJobCloseTaskRoles"
        Effect = "Allow"

        Action = [
          "iam:PassRole"
        ]

        Resource = [
          aws_iam_role.execution.arn,
          aws_iam_role.task.arn
        ]

        Condition = {
          StringEquals = {
            "iam:PassedToService" = "ecs-tasks.amazonaws.com"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "terraform_cloudwatch" {
  name = "${var.project_name}-terraform-cloudwatch"
  role = aws_iam_role.github_actions_terraform.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid    = "DescribeLogGroups"
        Effect = "Allow"

        Action = [
          "logs:DescribeLogGroups"
        ]

        Resource = "*"
      },
      {
        Sid    = "ManageJobCloseLogGroup"
        Effect = "Allow"

        Action = [
          "logs:CreateLogGroup",
          "logs:DeleteLogGroup",
          "logs:PutRetentionPolicy",
          "logs:DeleteRetentionPolicy",
          "logs:TagResource",
          "logs:UntagResource",
          "logs:ListTagsForResource"
        ]

        Resource = "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/ecs/${var.project_name}"
      }
    ]
  })
}

# Permissions for Terraform to manage the JobClose ECR repository.

resource "aws_iam_role_policy" "terraform_ecr" {
  name = "${var.project_name}-terraform-ecr"
  role = aws_iam_role.github_actions_terraform.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid    = "DescribeAndCreateECRRepository"
        Effect = "Allow"

        Action = [
          "ecr:DescribeRepositories",
          "ecr:CreateRepository"
        ]

        Resource = "*"
      },
      {
        Sid    = "ManageJobCloseECRRepository"
        Effect = "Allow"

        Action = [
          "ecr:DeleteRepository",
          "ecr:GetLifecyclePolicy",
          "ecr:PutLifecyclePolicy",
          "ecr:DeleteLifecyclePolicy",
          "ecr:ListTagsForResource",
          "ecr:TagResource",
          "ecr:UntagResource",
          "ecr:GetImageScanningConfiguration",
          "ecr:PutImageScanningConfiguration",
          "ecr:GetImageTagMutability",
          "ecr:PutImageTagMutability"
        ]

        Resource = "arn:aws:ecr:${var.aws_region}:${var.aws_account_id}:repository/${var.project_name}"
      }
    ]
  })
}

# Permissions for Terraform to manage the JobClose RDS database.

resource "aws_iam_role_policy" "terraform_rds" {
  name = "${var.project_name}-terraform-rds"
  role = aws_iam_role.github_actions_terraform.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid    = "DescribeRDSResources"
        Effect = "Allow"

        Action = [
          "rds:DescribeDBInstances",
          "rds:DescribeDBSubnetGroups",
          "rds:ListTagsForResource"
        ]

        Resource = "*"
      },
      {
        Sid    = "ManageJobCloseDatabase"
        Effect = "Allow"

        Action = [
          "rds:CreateDBInstance",
          "rds:ModifyDBInstance",
          "rds:DeleteDBInstance",
          "rds:AddTagsToResource",
          "rds:RemoveTagsFromResource"
        ]

        Resource = [
          "arn:aws:rds:${var.aws_region}:${var.aws_account_id}:db:${var.project_name}-db",
          "arn:aws:rds:${var.aws_region}:${var.aws_account_id}:subgrp:${var.project_name}-db-subnet-group"
        ]
      },
      {
        Sid    = "ManageDBSubnetGroups"
        Effect = "Allow"

        Action = [
          "rds:CreateDBSubnetGroup",
          "rds:ModifyDBSubnetGroup",
          "rds:DeleteDBSubnetGroup"
        ]

        Resource = "arn:aws:rds:${var.aws_region}:${var.aws_account_id}:subgrp:${var.project_name}-db-subnet-group"
      }
    ]
  })
}

# Permissions for Terraform to manage JobClose database secrets.

resource "aws_iam_role_policy" "terraform_secrets" {
  name = "${var.project_name}-terraform-secrets"
  role = aws_iam_role.github_actions_terraform.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid    = "ManageJobCloseDatabaseSecrets"
        Effect = "Allow"

        Action = [
          "secretsmanager:DescribeSecret",
          "secretsmanager:GetSecretValue",
          "secretsmanager:GetResourcePolicy",
          "secretsmanager:CreateSecret",
          "secretsmanager:PutSecretValue",
          "secretsmanager:DeleteSecret",
          "secretsmanager:RestoreSecret",
          "secretsmanager:TagResource",
          "secretsmanager:UntagResource",
          "secretsmanager:ListSecretVersionIds"
        ]

        Resource = [
          "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:${var.project_name}/database/*"
        ]
      }
    ]
  })
}

# Permissions for Terraform to manage the JobClose load balancer.

resource "aws_iam_role_policy" "terraform_alb" {
  name = "${var.project_name}-terraform-alb"
  role = aws_iam_role.github_actions_terraform.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid    = "DescribeLoadBalancingResources"
        Effect = "Allow"

        Action = [
          "elasticloadbalancing:DescribeLoadBalancers",
          "elasticloadbalancing:DescribeLoadBalancerAttributes",
          "elasticloadbalancing:DescribeTargetGroups",
          "elasticloadbalancing:DescribeTargetGroupAttributes",
          "elasticloadbalancing:DescribeListeners",
          "elasticloadbalancing:DescribeListenerAttributes",
          "elasticloadbalancing:DescribeRules",
          "elasticloadbalancing:DescribeTags"
        ]

        Resource = "*"
      },
      {
        Sid    = "ManageJobCloseLoadBalancer"
        Effect = "Allow"

        Action = [
          "elasticloadbalancing:CreateLoadBalancer",
          "elasticloadbalancing:DeleteLoadBalancer",
          "elasticloadbalancing:ModifyLoadBalancerAttributes",
          "elasticloadbalancing:CreateTargetGroup",
          "elasticloadbalancing:DeleteTargetGroup",
          "elasticloadbalancing:ModifyTargetGroup",
          "elasticloadbalancing:CreateListener",
          "elasticloadbalancing:DeleteListener",
          "elasticloadbalancing:ModifyListener",
          "elasticloadbalancing:AddTags",
          "elasticloadbalancing:RemoveTags"
        ]

        Resource = "*"
      }
    ]
  })
}

# Permissions for Terraform to manage SSL certificates.

resource "aws_iam_role_policy" "terraform_acm" {
  name = "${var.project_name}-terraform-acm"
  role = aws_iam_role.github_actions_terraform.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid    = "ManageCertificates"
        Effect = "Allow"

        Action = [
          "acm:DescribeCertificate",
          "acm:ListCertificates",
          "acm:RequestCertificate",
          "acm:DeleteCertificate",
          "acm:AddTagsToCertificate",
          "acm:RemoveTagsFromCertificate",
          "acm:ListTagsForCertificate"
        ]

        Resource = "*"
      }
    ]
  })
}

# Permissions for Terraform to manage JobClose DNS records.

resource "aws_iam_role_policy" "terraform_route53" {
  name = "${var.project_name}-terraform-route53"
  role = aws_iam_role.github_actions_terraform.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid    = "ReadHostedZoneAndRecords"
        Effect = "Allow"

        Action = [
          "route53:ListHostedZonesByName",
          "route53:GetHostedZone",
          "route53:ListResourceRecordSets",
          "route53:GetChange"
        ]

        Resource = "*"
      },
      {
        Sid    = "ManageDNSRecords"
        Effect = "Allow"

        Action = [
          "route53:ChangeResourceRecordSets"
        ]

        Resource = "arn:aws:route53:::hostedzone/*"
      }
    ]
  })
}

# Allow Terraform GitHub Actions to inspect IAM resources.
# No IAM creation, modification or deletion permissions are granted.

resource "aws_iam_role_policy" "terraform_iam_readonly" {
  name = "${var.project_name}-terraform-iam-readonly"
  role = aws_iam_role.github_actions_terraform.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid    = "ReadJobCloseIAMRoles"
        Effect = "Allow"

        Action = [
          "iam:GetRole",
          "iam:GetRolePolicy",
          "iam:ListRolePolicies",
          "iam:ListAttachedRolePolicies",
          "iam:ListRoleTags"
        ]

        Resource = [
          "arn:aws:iam::${var.aws_account_id}:role/${var.project_name}-ecs-execution-role",
          "arn:aws:iam::${var.aws_account_id}:role/${var.project_name}-ecs-task-role",
          "arn:aws:iam::${var.aws_account_id}:role/${var.project_name}-github-actions-role",
          "arn:aws:iam::${var.aws_account_id}:role/${var.project_name}-github-terraform-role"
        ]
      },
      {
        Sid      = "ReadGitHubOIDCProvider"
        Effect   = "Allow"
        Action   = ["iam:GetOpenIDConnectProvider"]
        Resource = aws_iam_openid_connect_provider.github.arn
      },
      {
        Sid      = "ListOIDCProviders"
        Effect   = "Allow"
        Action   = ["iam:ListOpenIDConnectProviders"]
        Resource = "*"
      },
      {
        Sid    = "ReadECSExecutionManagedPolicy"
        Effect = "Allow"

        Action = [
          "iam:GetPolicy",
          "iam:GetPolicyVersion",
          "iam:ListPolicyVersions"
        ]

        Resource = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
      }
    ]
  })
}
