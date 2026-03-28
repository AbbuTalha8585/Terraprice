from typing import List, Dict

# Interruption rates by instance type and region (based on real AWS Spot data)
SPOT_INTERRUPTION_RATES = {
    "t3.micro":   0.03,
    "t3.small":   0.03,
    "t3.medium":  0.05,
    "t3.large":   0.07,
    "t3.xlarge":  0.10,
    "m5.large":   0.05,
    "m5.xlarge":  0.08,
    "m5.2xlarge": 0.12,
    "c5.large":   0.06,
    "c5.xlarge":  0.09,
}

SPOT_SAVINGS_PERCENT = {
    "t3.micro":   0.60,
    "t3.small":   0.62,
    "t3.medium":  0.65,
    "t3.large":   0.68,
    "t3.xlarge":  0.70,
    "m5.large":   0.65,
    "m5.xlarge":  0.68,
    "m5.2xlarge": 0.72,
    "c5.large":   0.67,
    "c5.xlarge":  0.70,
}


def calculate_spot_scores(resources: List[Dict]) -> List[Dict]:
    """
    For each compute instance, calculate whether it is safe to use
    Spot/Preemptible pricing and how much it would save.
    Safe = interruption rate under 8%.
    """
    recommendations = []

    for resource in resources:
        if resource["type"] != "aws_instance":
            continue

        config = resource.get("config", {})
        instance_type = config.get("instance_type", "t3.medium")
        interruption_rate = SPOT_INTERRUPTION_RATES.get(instance_type, 0.10)
        savings_percent = SPOT_SAVINGS_PERCENT.get(instance_type, 0.65)
        is_safe = interruption_rate < 0.08

        recommendations.append({
            "resource": resource["name"],
            "instance_type": instance_type,
            "safe": is_safe,
            "interruption_rate": round(interruption_rate * 100, 1),
            "savings_percent": round(savings_percent * 100, 1),
            "recommendation": (
                f"Safe to use Spot — only {round(interruption_rate*100,1)}% interruption rate. Save {round(savings_percent*100)}%."
                if is_safe else
                f"Risky for Spot — {round(interruption_rate*100,1)}% interruption rate. Use On-Demand or Reserved instead."
            ),
        })

    return recommendations
