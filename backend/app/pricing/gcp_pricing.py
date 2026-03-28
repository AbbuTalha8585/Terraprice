import httpx
from app.pricing.cache import get_cached, set_cached, make_key

# GCP Cloud Billing Catalog API — public, no auth needed for basic pricing
GCP_PRICING_URL = "https://cloudpricingcalculator.appspot.com/static/data/pricelist.json"

# Fallback prices
GCP_PRICES = {
    "e2-micro":      {"compute": 6.11},
    "e2-small":      {"compute": 12.23},
    "e2-medium":     {"compute": 24.46},
    "n1-standard-1": {"compute": 24.27},
    "n1-standard-2": {"compute": 48.54},
    "n1-standard-4": {"compute": 97.09},
    "n1-standard-8": {"compute": 194.18},
    "n2-standard-2": {"compute": 58.09},
    "n2-standard-4": {"compute": 116.18},
    "db-f1-micro":       {"database": 7.67},
    "db-g1-small":       {"database": 25.55},
    "db-n1-standard-1":  {"database": 46.02},
    "db-n1-standard-2":  {"database": 92.03},
    "gcs_standard":  {"storage": 0.020},
    "persistent_disk":{"storage": 0.040},
    "cloud_lb":      {"networking": 14.60},
    "nat":           {"networking": 30.66},
}

AWS_TO_GCP = {
    "t3.micro":   "e2-micro",
    "t3.small":   "e2-small",
    "t3.medium":  "n1-standard-2",
    "t3.large":   "n1-standard-4",
    "t3.xlarge":  "n1-standard-8",
    "m5.large":   "n2-standard-2",
    "m5.xlarge":  "n2-standard-4",
    "m5.2xlarge": "n2-standard-4",
    "c5.large":   "n2-standard-2",
}

# GCP SKU map for compute instances (us-central1)
GCP_SKU_PRICES = {
    "e2-micro":      0.00838,
    "e2-small":      0.01675,
    "e2-medium":     0.03350,
    "n1-standard-1": 0.04749,
    "n1-standard-2": 0.09498,
    "n1-standard-4": 0.18997,
    "n1-standard-8": 0.37994,
    "n2-standard-2": 0.09764,
    "n2-standard-4": 0.19528,
}


def get_live_gcp_price(gcp_type: str) -> float:
    """Get GCP compute price — uses known SKU prices with cache."""
    cache_key = make_key("gcp_live", "compute", gcp_type)
    cached = get_cached(cache_key)
    if cached:
        return cached

    try:
        hourly = GCP_SKU_PRICES.get(gcp_type)
        if hourly:
            monthly = round(hourly * 730, 2)
            set_cached(cache_key, monthly)
            return monthly
    except Exception as e:
        print(f"GCP pricing failed for {gcp_type}: {e} — using fallback")

    return GCP_PRICES.get(gcp_type, {"compute": 48.54})["compute"]


def get_gcp_cost(resource_type: str, config: dict, count: int = 1) -> float:
    cost = _calculate_gcp_cost(resource_type, config)
    return round(cost * count, 2)


def _calculate_gcp_cost(resource_type: str, config: dict) -> float:
    if resource_type in ("aws_instance", "azurerm_virtual_machine", "google_compute_instance"):
        itype = config.get("instance_type") or config.get("vm_size") or config.get("machine_type") or "t3.medium"
        gcp_type = str(itype) if str(itype) in GCP_PRICES else AWS_TO_GCP.get(str(itype), "e2-medium")
        return get_live_gcp_price(gcp_type)

    elif resource_type in ("aws_db_instance", "azurerm_sql_database", "google_sql_database_instance"):
        return GCP_PRICES["db-n1-standard-1"]["database"]

    elif resource_type in ("aws_s3_bucket", "azurerm_storage_account", "google_storage_bucket"):
        s_val = config.get("storage_size") or config.get("allocated_storage") or 100
        storage_gb = int(s_val)
        return round(storage_gb * GCP_PRICES["gcs_standard"]["storage"], 2)

    elif resource_type in ("aws_lb", "azurerm_lb", "aws_alb", "google_compute_forwarding_rule"):
        return GCP_PRICES["cloud_lb"]["networking"]

    elif resource_type in ("aws_ecr_repository", "azurerm_container_registry", "google_artifact_registry_repository"):
        return 0.10

    elif any(k in resource_type for k in ("network", "subnet", "firewall", "route", "vpc", "internet_gateway", "iam_role", "iam_policy")):
        return 0.0

    elif "secretsmanager_secret" in resource_type or "key_vault_secret" in resource_type or "secret_manager_secret" in resource_type:
        return 0.40

    return -1.0
