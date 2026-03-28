variable "aws_region" {
  description = "AWS region to deploy TerraPrice"
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  default     = "terraprice"
}

variable "db_password" {
  description = "PostgreSQL database password"
  sensitive   = true
}

variable "ssh_public_key" {
  description = "SSH public key for EC2 k3s node access"
  type        = string
}
