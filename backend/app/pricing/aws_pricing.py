import os
import json
import boto3
from app.pricing.cache import get_cached, set_cached, make_key

# Fallback prices when AWS API unavailable
AWS_PRICES = {
    "t3.micro":     {"compute": 7.59},
    "t3.small":     {"compute": 15.18},
    "t3.medium":    {"compute": 30.37},
    "t3.large":     {"compute": 60.74},
    "t3.xlarge":    {"compute": 121.47},
    "m5.large":     {"compute": 70.08},
    "m5.xlarge":    {"compute": 140.16},
    "m5.2xlarge":   {"compute": 280.32},
    "c5.large":     {"compute": 62.05},
    "c5.xlarge":    {"compute": 124.10},
    "db.t3.micro":  {"database": 14.60},
    "db.t3.small":  {"database": 29.20},
    "db.t3.medium": {"database": 58.40},
    "db.t3.large":  {"database": 116.80},
    "db.m5.large":  {"database": 138.70},
    "s3":           {"storage": 0.023},
    "gp2":          {"storage": 0.10},
    "gp3":          {"storage": 0.08},
    "nat_gateway":  {"networking": 32.85},
    "alb":          {"networking": 18.40},
    "vpc":          {"networking": 0.0},
}


def _has_aws_credentials() -> bool:
    """Check if AWS credentials are available."""
    return bool(
        os.getenv("AWS_ACCESS_KEY_ID") and
        os.getenv("AWS_SECRET_ACCESS_KEY")
    )


def get_live_ec2_price(instance_type: str) -> float:
    """Fetch real EC2 price from AWS Pricing API."""
    cache_key = make_key("aws_live_ec2", instance_type)
    cached = get_cached(cache_key)
    if cached:
        print(f"[AWS] Cache hit for {instance_type}: ${cached}/mo")
        return cached

    if not _has_aws_credentials():
        print(f"[AWS] No credentials — using fallback for {instance_type}")
        return AWS_PRICES.get(instance_type, {"compute": 30.37})["compute"]

    try:
        print(f"[AWS] Fetching live price for {instance_type}...")
        client = boto3.client(
            "pricing",
            region_name="us-east-1",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )
        response = client.get_products(
            ServiceCode="AmazonEC2",
            Filters=[
                {"Type": "TERM_MATCH", "Field": "instanceType",     "Value": instance_type},
                {"Type": "TERM_MATCH", "Field": "location",         "Value": "US East (N. Virginia)"},
                {"Type": "TERM_MATCH", "Field": "operatingSystem",  "Value": "Linux"},
                {"Type": "TERM_MATCH", "Field": "tenancy",          "Value": "Shared"},
                {"Type": "TERM_MATCH", "Field": "capacitystatus",   "Value": "Used"},
                {"Type": "TERM_MATCH", "Field": "preInstalledSw",   "Value": "NA"},
            ],
            MaxResults=1,
        )

        if response["PriceList"]:
            price_data = json.loads(response["PriceList"][0])
            terms = price_data["terms"]["OnDemand"]
            for term in terms.values():
                for price_dim in term["priceDimensions"].values():
                    hourly = float(price_dim["pricePerUnit"]["USD"])
                    if hourly > 0:
                        monthly = round(hourly * 730, 2)
                        set_cached(cache_key, monthly)
                        print(f"[AWS] Live price for {instance_type}: ${monthly}/mo")
                        return monthly

    except Exception as e:
        print(f"[AWS] API error for {instance_type}: {e} — using fallback")

    fallback = AWS_PRICES.get(instance_type, {"compute": 30.37})["compute"]
    print(f"[AWS] Fallback price for {instance_type}: ${fallback}/mo")
    return fallback


def get_live_rds_price(instance_class: str) -> float:
    """Fetch real RDS price from AWS Pricing API."""
    cache_key = make_key("aws_live_rds", instance_class)
    cached = get_cached(cache_key)
    if cached:
        return cached

    if not _has_aws_credentials():
        return AWS_PRICES.get(instance_class, {"database": 14.60})["database"]

    try:
        print(f"[AWS] Fetching live RDS price for {instance_class}...")
        client = boto3.client(
            "pricing",
            region_name="us-east-1",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )
        response = client.get_products(
            ServiceCode="AmazonRDS",
            Filters=[
                {"Type": "TERM_MATCH", "Field": "instanceType",    "Value": instance_class},
                {"Type": "TERM_MATCH", "Field": "databaseEngine",  "Value": "MySQL"},
                {"Type": "TERM_MATCH", "Field": "deploymentOption","Value": "Single-AZ"},
                {"Type": "TERM_MATCH", "Field": "location",        "Value": "US East (N. Virginia)"},
            ],
            MaxResults=1,
        )

        if response["PriceList"]:
            price_data = json.loads(response["PriceList"][0])
            terms = price_data["terms"]["OnDemand"]
            for term in terms.values():
                for price_dim in term["priceDimensions"].values():
                    hourly = float(price_dim["pricePerUnit"]["USD"])
                    if hourly > 0:
                        monthly = round(hourly * 730, 2)
                        set_cached(cache_key, monthly)
                        print(f"[AWS] Live RDS price for {instance_class}: ${monthly}/mo")
                        return monthly

    except Exception as e:
        print(f"[AWS] RDS API error for {instance_class}: {e} — using fallback")

    return AWS_PRICES.get(instance_class, {"database": 14.60})["database"]


def get_aws_cost(resource_type: str, config: dict, count: int = 1) -> float:
    cost = _calculate_aws_cost(resource_type, config)
    return round(cost * count, 2)


def _calculate_aws_cost(resource_type: str, config: dict) -> float:
    if resource_type in ("aws_instance", "azurerm_virtual_machine", "google_compute_instance"):
        instance_type = config.get("instance_type", config.get("vm_size", config.get("machine_type", "t3.medium")))
        # If it's an Azure/GCP type, we should ideally map it back to AWS type, but for now we fallback to t3.medium or use it as is if it matches
        return get_live_ec2_price(instance_type)

    elif resource_type in ("aws_db_instance", "azurerm_sql_database", "google_sql_database_instance"):
        instance_class = config.get("instance_class", "db.t3.micro")
        storage_gb = int(config.get("allocated_storage", 20))
        db_cost = get_live_rds_price(instance_class)
        storage_cost = round(storage_gb * AWS_PRICES["gp3"]["storage"], 2)
        return db_cost + storage_cost

    elif resource_type in ("aws_s3_bucket", "azurerm_storage_account", "google_storage_bucket"):
        storage_gb = int(config.get("storage_size", 100))
        return round(storage_gb * AWS_PRICES["s3"]["storage"], 2)

    elif resource_type in ("aws_lb", "aws_alb", "azurerm_lb", "google_compute_forwarding_rule"):
        return AWS_PRICES["alb"]["networking"]

    elif resource_type in ("aws_nat_gateway", "azurerm_nat_gateway", "google_compute_router_nat"):
        return AWS_PRICES["nat_gateway"]["networking"]

    elif any(k in resource_type for k in ("subnet", "security_group", "route_table", "internet_gateway", "eip", "vpc", "network", "iam_role", "iam_policy")):
        return 0.0

    elif "ecr_repository" in resource_type or "container_registry" in resource_type or "artifact_registry" in resource_type:
        return 0.0

    elif "secretsmanager_secret" in resource_type or "key_vault_secret" in resource_type or "secret_manager_secret" in resource_type:
        return 0.40

    return -1.0
