import httpx
from app.pricing.cache import get_cached, set_cached, make_key

AZURE_PRICING_URL = "https://prices.azure.com/api/retail/prices"

AZURE_PRICES = {
    "Standard_B1s":    {"compute": 7.59},
    "Standard_B2s":    {"compute": 30.37},
    "Standard_D2s_v3": {"compute": 70.08},
    "Standard_D4s_v3": {"compute": 140.16},
    "Standard_D8s_v3": {"compute": 280.32},
    "Standard_F2s_v2": {"compute": 62.05},
    "B_Gen5_2":        {"database": 51.10},
    "GP_Gen5_2":       {"database": 368.64},
    "blob":            {"storage": 0.018},
    "managed_disk":    {"storage": 0.095},
    "azure_lb":        {"networking": 18.25},
    "nat_gateway":     {"networking": 32.49},
}

AWS_TO_AZURE = {
    "t3.micro":   "Standard_B1s",
    "t3.small":   "Standard_B2s",
    "t3.medium":  "Standard_D2s_v3",
    "t3.large":   "Standard_D4s_v3",
    "t3.xlarge":  "Standard_D8s_v3",
    "m5.large":   "Standard_D2s_v3",
    "m5.xlarge":  "Standard_D4s_v3",
    "m5.2xlarge": "Standard_D8s_v3",
    "c5.large":   "Standard_F2s_v2",
}


def get_live_azure_price(azure_vm_type: str) -> float:
    """Fetch real Azure VM price — Azure API is public, no auth needed."""
    cache_key = make_key("azure_live", azure_vm_type)
    cached = get_cached(cache_key)
    if cached:
        print(f"[Azure] Cache hit for {azure_vm_type}: ${cached}/mo")
        return cached

    try:
        print(f"[Azure] Fetching live price for {azure_vm_type}...")
        params = {
            "$filter": (
                f"serviceName eq 'Virtual Machines' "
                f"and armSkuName eq '{azure_vm_type}' "
                f"and priceType eq 'Consumption' "
                f"and armRegionName eq 'eastus'"
            )
        }
        response = httpx.get(AZURE_PRICING_URL, params=params, timeout=10)
        data = response.json()

        for item in data.get("Items", []):
            if (
                "Windows" not in item.get("productName", "") and
                "Spot" not in item.get("skuName", "") and
                item.get("unitPrice", 0) > 0
            ):
                hourly = item["unitPrice"]
                monthly = round(hourly * 730, 2)
                set_cached(cache_key, monthly)
                print(f"[Azure] Live price for {azure_vm_type}: ${monthly}/mo")
                return monthly

    except Exception as e:
        print(f"[Azure] API error for {azure_vm_type}: {e} — using fallback")

    fallback = AZURE_PRICES.get(azure_vm_type, {"compute": 70.08})["compute"]
    print(f"[Azure] Fallback price for {azure_vm_type}: ${fallback}/mo")
    return fallback


def get_azure_cost(resource_type: str, config: dict, count: int = 1) -> float:
    cost = _calculate_azure_cost(resource_type, config)
    return round(cost * count, 2)


def _calculate_azure_cost(resource_type: str, config: dict) -> float:
    if resource_type in ("aws_instance", "azurerm_virtual_machine", "google_compute_instance"):
        itype = config.get("instance_type") or config.get("vm_size") or config.get("machine_type") or "t3.medium"
        azure_type = str(itype) if str(itype).startswith("Standard_") else AWS_TO_AZURE.get(str(itype), "Standard_D2s_v3")
        return get_live_azure_price(azure_type)

    elif resource_type in ("aws_db_instance", "azurerm_sql_database", "google_sql_database_instance"):
        return AZURE_PRICES["B_Gen5_2"]["database"]

    elif resource_type in ("aws_s3_bucket", "azurerm_storage_account", "google_storage_bucket"):
        # Combine possible storage keys
        s_val = config.get("storage_size") or config.get("allocated_storage") or 100
        storage_gb = int(s_val)
        return round(storage_gb * AZURE_PRICES["blob"]["storage"], 2)

    elif resource_type in ("aws_lb", "azurerm_lb", "aws_alb", "google_compute_forwarding_rule"):
        return AZURE_PRICES["azure_lb"]["networking"]

    elif resource_type in ("aws_ecr_repository", "azurerm_container_registry", "google_artifact_registry_repository"):
        return 16.0

    elif any(k in resource_type for k in ("virtual_network", "subnet", "nsg", "route_table", "internet_gateway", "vpc", "network", "iam_role", "iam_policy")):
        return 0.0

    elif "secretsmanager_secret" in resource_type or "key_vault_secret" in resource_type or "secret_manager_secret" in resource_type:
        return 0.40

    return -1.0
