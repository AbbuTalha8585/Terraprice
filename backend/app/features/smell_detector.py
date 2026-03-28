from typing import List, Dict


SMELL_RULES = [
    {
        "type": "aws_nat_gateway",
        "check": lambda config, count: count > 1,
        "issue": "Multiple NAT gateways detected",
        "fix": "Use one shared NAT gateway across AZs to reduce cost",
        "savings_per_extra": 32.85,
    },
    {
        "type": "aws_db_instance",
        "check": lambda config, count: config.get("multi_az") == True and config.get("instance_class", "").startswith("db.t3"),
        "issue": "Multi-AZ enabled on a small dev/test database",
        "fix": "Disable multi_az for non-production databases",
        "savings_per_extra": 58.40,
    },
    {
        "type": "aws_instance",
        "check": lambda config, count: config.get("instance_type") in ("m5.2xlarge", "m5.4xlarge", "t3.xlarge"),
        "issue": "Large instance without auto-scaling configured",
        "fix": "Add an Auto Scaling Group — scale down during off-peak hours",
        "savings_per_extra": 60.0,
    },
    {
        "type": "aws_db_instance",
        "check": lambda config, count: str(config.get("storage_type", "gp2")) == "gp2",
        "issue": "Using gp2 storage — gp3 is identical but 20% cheaper",
        "fix": "Change storage_type from gp2 to gp3",
        "savings_per_extra": 4.0,
    },
]


def detect_smells(resources: List[Dict]) -> List[Dict]:
    """
    Scans a list of parsed resources and returns a list of expensive
    anti-patterns found, with fix suggestions and estimated savings.
    """
    issues = []

    for rule in SMELL_RULES:
        matching = [r for r in resources if r["type"] == rule["type"]]
        for resource in matching:
            count = resource.get("count", 1)
            config = resource.get("config", {})
            try:
                if rule["check"](config, count):
                    issues.append({
                        "resource": resource["name"],
                        "issue": rule["issue"],
                        "savings": rule["savings_per_extra"],
                        "fix": rule["fix"],
                    })
            except Exception:
                continue

    return issues
