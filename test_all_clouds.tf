# --- ALL CLOUD TEST FILE ---
# Use this file to test TerraPrice cross-cloud mapping.

# 1. AWS RESOURCES
resource "aws_instance" "aws_web" {
  instance_type = "t3.medium"
}

resource "aws_s3_bucket" "aws_storage" {
  bucket = "my-terraprice-test-bucket"
}

resource "aws_lb" "aws_gateway" {
  name = "aws-lb"
}

resource "aws_ecr_repository" "aws_repo" {
  name = "test-repo"
}

resource "aws_iam_role" "aws_identity" {
  name = "test-role"
}

# 2. AZURE RESOURCES (Mapped back to AWS/GCP)
resource "azurerm_virtual_machine" "azure_vm" {
  vm_size = "Standard_B2s"
}

resource "azurerm_storage_account" "azure_blob" {
  name = "teststorage"
}

# 3. GCP RESOURCES (Mapped back to AWS/Azure)
resource "google_compute_instance" "gcp_node" {
  machine_type = "e2-small"
}

resource "google_storage_bucket" "gcp_bucket" {
  name = "test-gcp-bucket"
}

# 4. UNSUPPORTED SERVICE (Shows "Not Available")
resource "aws_cloudhsm_v2_cluster" "hsm_cluster" {
  hsm_type = "hsm1.medium"
}
