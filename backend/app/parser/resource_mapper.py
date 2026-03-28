from typing import Dict, Optional

# Maps Terraform resource types to friendly names and cloud equivalents
RESOURCE_MAP = {
    # Compute
    "aws_instance":              {"label": "Virtual Machine",  "azure": "azurerm_virtual_machine",      "gcp": "google_compute_instance"},
    "azurerm_virtual_machine":   {"label": "Virtual Machine",  "aws": "aws_instance",                   "gcp": "google_compute_instance"},
    "google_compute_instance":   {"label": "Virtual Machine",  "aws": "aws_instance",                   "azure": "azurerm_virtual_machine"},

    # Database
    "aws_db_instance":           {"label": "Database",         "azure": "azurerm_sql_database",         "gcp": "google_sql_database_instance"},
    "azurerm_sql_database":      {"label": "Database",         "aws": "aws_db_instance",                "gcp": "google_sql_database_instance"},
    "google_sql_database_instance": {"label": "Database",      "aws": "aws_db_instance",                "azure": "azurerm_sql_database"},

    # Storage
    "aws_s3_bucket":             {"label": "Object Storage",   "azure": "azurerm_storage_account",      "gcp": "google_storage_bucket"},
    "azurerm_storage_account":   {"label": "Object Storage",   "aws": "aws_s3_bucket",                  "gcp": "google_storage_bucket"},
    "google_storage_bucket":     {"label": "Object Storage",   "aws": "aws_s3_bucket",                  "azure": "azurerm_storage_account"},

    # Load Balancer
    "aws_lb":                    {"label": "Load Balancer",    "azure": "azurerm_lb",                   "gcp": "google_compute_forwarding_rule"},
    "azurerm_lb":                {"label": "Load Balancer",    "aws": "aws_lb",                         "gcp": "google_compute_forwarding_rule"},
    "google_compute_forwarding_rule": {"label": "Load Balancer","aws": "aws_lb",                        "azure": "azurerm_lb"},

    # Networking
    "aws_nat_gateway":           {"label": "NAT Gateway",      "azure": "azurerm_nat_gateway",          "gcp": "google_compute_router_nat"},
    "aws_vpc":                   {"label": "Virtual Network",  "azure": "azurerm_virtual_network",      "gcp": "google_compute_network"},
}


def map_resource(resource_type: str) -> Optional[Dict]:
    """Returns the mapping info for a given Terraform resource type."""
    return RESOURCE_MAP.get(resource_type)


def get_resource_label(resource_type: str) -> str:
    """Returns a human-friendly label for the resource type."""
    mapping = RESOURCE_MAP.get(resource_type)
    if mapping:
        return mapping["label"]
    return resource_type.replace("aws_", "").replace("azurerm_", "").replace("google_", "").replace("_", " ").title()
