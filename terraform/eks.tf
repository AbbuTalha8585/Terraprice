module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "${var.project_name}-eks-cluster"
  cluster_version = "1.30"

  cluster_endpoint_public_access = true

  vpc_id                   = aws_vpc.main.id
  subnet_ids               = [aws_subnet.public_a.id, aws_subnet.public_b.id]
  control_plane_subnet_ids = [aws_subnet.public_a.id, aws_subnet.public_b.id]

  eks_managed_node_group_defaults = {
    instance_types = ["t3.micro"]
  }

  eks_managed_node_groups = {
    main = {
      min_size     = 4
      max_size     = 5
      desired_size = 4

      instance_types = ["t3.micro"]
    }
  }

  # Allow the creator (your AWS CLI user) to access the cluster via kubectl
  enable_cluster_creator_admin_permissions = true

  node_security_group_additional_rules = {
    ingress_self_all = {
      description = "Node to node all ports/protocols"
      protocol    = "-1"
      from_port   = 0
      to_port     = 0
      type        = "ingress"
      self        = true
    }
  }

  tags = {
    Environment = "dev"
    Project     = var.project_name
  }
}
