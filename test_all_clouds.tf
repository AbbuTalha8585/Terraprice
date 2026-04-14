# ═══════════════════════════════════════════════════════════════════════════════
# test_all_clouds.tf
# Full multi-cloud test file for TerraPrice Topology Visualizer.
# Covers: provider blocks (dynamic region), real resource references,
#         all major NEW resource types across AWS, Azure, and GCP.
# ═══════════════════════════════════════════════════════════════════════════════

# ── To switch clouds, uncomment ONE provider block at a time ──────────────────

# ── AWS ──────────────────────────────────────────────────────────────────────
provider "aws" {
  region = "ap-south-1"   # Mumbai — change to test dynamic region
}

# ── AZURE (uncomment to test Azure flow) ─────────────────────────────────────
# provider "azurerm" {
#   features {}
#   location = "eastus2"
# }

# ── GCP (uncomment to test GCP flow) ─────────────────────────────────────────
# provider "google" {
#   project = "my-project"
#   region  = "us-central1"
# }

# ─────────────────────────────────────────────────────────────────────────────
# AWS RESOURCES — Full topology: Internet → IGW → ALB → Web → Backend → DB
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "ap-south-1a"
}

resource "aws_subnet" "private" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "ap-south-1b"
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
}

resource "aws_nat_gateway" "nat" {
  subnet_id     = aws_subnet.public.id
  allocation_id = "eipalloc-00000000"
}

resource "aws_security_group" "web_sg" {
  vpc_id = aws_vpc.main.id
  name   = "web-sg"
}

resource "aws_wafv2_web_acl" "waf" {
  name  = "terraprice-waf"
  scope = "REGIONAL"
}

# Load Balancer / CDN / API Gateway
resource "aws_lb" "alb" {
  name               = "terraprice-alb"
  load_balancer_type = "application"
  subnets            = [aws_subnet.public.id]
  security_groups    = [aws_security_group.web_sg.id]
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.alb.arn
  port              = "80"
}

resource "aws_lb_target_group" "web_tg" {
  name     = "web-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
}

resource "aws_cloudfront_distribution" "cdn" {
  enabled = true
}

resource "aws_api_gateway_rest_api" "api" {
  name = "terraprice-api"
}

# Compute — EC2, Lambda, ECS, EKS
resource "aws_instance" "web" {
  instance_type          = "t3.medium"
  subnet_id              = aws_subnet.private.id
  vpc_security_group_ids = [aws_security_group.web_sg.id]
}

resource "aws_instance" "backend" {
  instance_type          = "t3.large"
  subnet_id              = aws_subnet.private.id
  vpc_security_group_ids = [aws_security_group.web_sg.id]
}

resource "aws_autoscaling_group" "asg" {
  min_size = 1
  max_size = 4
}

resource "aws_lambda_function" "processor" {
  function_name = "event-processor"
  runtime       = "python3.11"
  handler       = "main.handler"
}

resource "aws_ecs_cluster" "cluster" {
  name = "terraprice-cluster"
}

resource "aws_ecs_service" "svc" {
  name    = "backend-svc"
  cluster = aws_ecs_cluster.cluster.id
}

resource "aws_eks_cluster" "eks" {
  name       = "terraprice-eks"
  role_arn   = aws_iam_role.eks_role.arn
}

# Database family
resource "aws_db_instance" "postgres" {
  instance_class         = "db.t3.medium"
  engine                 = "postgres"
  allocated_storage      = 20
  vpc_security_group_ids = [aws_security_group.web_sg.id]
}

resource "aws_dynamodb_table" "sessions" {
  name         = "terraprice-sessions"
  billing_mode = "PAY_PER_REQUEST"
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id     = "terraprice-cache"
  engine         = "redis"
  node_type      = "cache.t3.micro"
}

resource "aws_opensearch_domain" "search" {
  domain_name = "terraprice-search"
}

resource "aws_redshift_cluster" "warehouse" {
  cluster_identifier = "terraprice-dw"
  node_type          = "dc2.large"
}

resource "aws_kinesis_stream" "events" {
  name             = "terraprice-events"
  shard_count      = 1
}

# Storage & Messaging
resource "aws_s3_bucket" "reports" {
  bucket = "terraprice-reports"
}

resource "aws_efs_file_system" "shared" {
  creation_token = "terraprice-efs"
}

resource "aws_sqs_queue" "jobs" {
  name = "terraprice-jobs"
}

resource "aws_sns_topic" "alerts" {
  name = "terraprice-alerts"
}

resource "aws_msk_cluster" "kafka" {
  cluster_name = "terraprice-kafka"
}

# Identity & Security
resource "aws_iam_role" "ec2_role" {
  name = "ec2-role"
}

resource "aws_iam_role" "eks_role" {
  name = "eks-role"
}

resource "aws_kms_key" "data_key" {
  description = "Encrypt data at rest"
}

resource "aws_secretsmanager_secret" "db_password" {
  name = "db/password"
}

resource "aws_cognito_user_pool" "users" {
  name = "terraprice-users"
}

resource "aws_acm_certificate" "cert" {
  domain_name       = "terraprice.io"
  validation_method = "DNS"
}

# DNS
resource "aws_route53_zone" "primary" {
  name = "terraprice.io"
}

# Monitoring
resource "aws_cloudwatch_log_group" "app_logs" {
  name = "/aws/app/terraprice"
}

# Container Registry
resource "aws_ecr_repository" "app_repo" {
  name = "terraprice-app"
}

# Unsupported (will show generic RES box)
resource "aws_cloudhsm_v2_cluster" "hsm" {
  hsm_type = "hsm1.medium"
}


# ─────────────────────────────────────────────────────────────────────────────
# AZURE RESOURCES — comment out AWS provider above and uncomment Azure provider
# Uncomment the block below to test Azure topology
# ─────────────────────────────────────────────────────────────────────────────
#
# resource "azurerm_virtual_network" "vnet" {
#   name          = "terraprice-vnet"
#   address_space = ["10.1.0.0/16"]
# }
# resource "azurerm_subnet" "frontend" {
#   name             = "frontend-subnet"
#   address_prefixes = ["10.1.1.0/24"]
# }
# resource "azurerm_subnet" "backend_sub" {
#   name             = "backend-subnet"
#   address_prefixes = ["10.1.2.0/24"]
# }
# resource "azurerm_public_ip" "pip" {
#   name              = "terraprice-pip"
#   allocation_method = "Static"
# }
# resource "azurerm_network_security_group" "nsg" {
#   name = "terraprice-nsg"
# }
# resource "azurerm_firewall" "fw" {
#   name = "terraprice-fw"
# }
# resource "azurerm_application_gateway" "agw" {
#   name = "terraprice-agw"
# }
# resource "azurerm_api_management" "apim" {
#   name     = "terraprice-apim"
#   sku_name = "Developer_1"
# }
# resource "azurerm_frontdoor" "fd" {
#   name = "terraprice-fd"
# }
# resource "azurerm_linux_virtual_machine" "web_vm" {
#   name   = "web-vm"
#   vm_size = "Standard_B2s"
# }
# resource "azurerm_linux_virtual_machine" "backend_vm" {
#   name    = "backend-vm"
#   vm_size = "Standard_B4s"
# }
# resource "azurerm_kubernetes_cluster" "aks" {
#   name = "terraprice-aks"
# }
# resource "azurerm_linux_function_app" "func" {
#   name = "terraprice-func"
# }
# resource "azurerm_linux_web_app" "webapp" {
#   name = "terraprice-web"
# }
# resource "azurerm_postgresql_server" "pg" {
#   name                = "terraprice-pg"
#   sku_name            = "GP_Gen5_2"
# }
# resource "azurerm_cosmosdb_account" "cosmos" {
#   name = "terraprice-cosmos"
# }
# resource "azurerm_redis_cache" "cache" {
#   name     = "terraprice-redis"
#   sku_name = "Standard"
# }
# resource "azurerm_mssql_server" "sql" {
#   name = "terraprice-sql"
# }
# resource "azurerm_synapse_workspace" "syn" {
#   name = "terraprice-synapse"
# }
# resource "azurerm_storage_account" "blob" {
#   name = "terrablob"
# }
# resource "azurerm_eventhub_namespace" "eh" {
#   name = "terraprice-eh"
# }
# resource "azurerm_service_bus_namespace" "sb" {
#   name = "terraprice-sb"
# }
# resource "azurerm_key_vault" "kv" {
#   name = "terraprice-kv"
# }
# resource "azurerm_user_assigned_identity" "msi" {
#   name = "terraprice-msi"
# }


# ─────────────────────────────────────────────────────────────────────────────
# GCP RESOURCES — comment out AWS provider above and uncomment GCP provider
# Uncomment the block below to test GCP topology
# ─────────────────────────────────────────────────────────────────────────────
#
# resource "google_compute_network" "vpc" {
#   name = "terraprice-vpc"
# }
# resource "google_compute_subnetwork" "public_sub" {
#   name          = "public-subnet"
#   ip_cidr_range = "10.2.1.0/24"
#   network       = google_compute_network.vpc.id
# }
# resource "google_compute_subnetwork" "private_sub" {
#   name          = "private-subnet"
#   ip_cidr_range = "10.2.2.0/24"
#   network       = google_compute_network.vpc.id
# }
# resource "google_compute_router" "router" {
#   name    = "terraprice-router"
#   network = google_compute_network.vpc.id
# }
# resource "google_compute_firewall" "fw" {
#   name    = "terraprice-fw"
#   network = google_compute_network.vpc.name
# }
# resource "google_compute_forwarding_rule" "lb" {
#   name = "terraprice-lb"
# }
# resource "google_compute_url_map" "urlmap" {
#   name = "terraprice-urlmap"
# }
# resource "google_api_gateway_api" "api" {
#   api_id = "terraprice-api"
# }
# resource "google_compute_instance" "web" {
#   name         = "web-instance"
#   machine_type = "e2-medium"
# }
# resource "google_compute_instance" "backend" {
#   name         = "backend-instance"
#   machine_type = "e2-standard-2"
# }
# resource "google_container_cluster" "gke" {
#   name = "terraprice-gke"
# }
# resource "google_cloud_run_service" "api" {
#   name = "terraprice-api"
# }
# resource "google_cloudfunctions_function" "processor" {
#   name    = "event-processor"
#   runtime = "python310"
# }
# resource "google_sql_database_instance" "pg" {
#   name             = "terraprice-pg"
#   database_version = "POSTGRES_14"
# }
# resource "google_spanner_instance" "spanner" {
#   name         = "terraprice-spanner"
#   config       = "regional-us-central1"
# }
# resource "google_bigquery_dataset" "dw" {
#   dataset_id = "terraprice_dw"
# }
# resource "google_redis_instance" "cache" {
#   name       = "terraprice-cache"
#   tier       = "STANDARD_HA"
# }
# resource "google_storage_bucket" "gcs" {
#   name = "terraprice-gcs"
# }
# resource "google_pubsub_topic" "events" {
#   name = "terraprice-events"
# }
# resource "google_service_account" "sa" {
#   account_id = "terraprice-sa"
# }
# resource "google_kms_key_ring" "keyring" {
#   name     = "terraprice-keyring"
#   location = "us-central1"
# }
# resource "google_secret_manager_secret" "db_pass" {
#   secret_id = "db-password"
# }
