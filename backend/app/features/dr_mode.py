from typing import Dict


DR_MULTIPLIERS = {
    "hot":  1.95,   # Full duplicate running 24/7 — ~2x cost
    "warm": 1.40,   # Scaled-down duplicate always on — ~1.4x cost
    "cold": 1.10,   # Snapshots + stopped instances — ~1.1x cost
}


def calculate_dr_cost(
    total_aws: float,
    total_azure: float,
    total_gcp: float,
    dr_type: str = "warm",
) -> Dict:
    """
    Calculates the cost of running a disaster recovery setup.
    hot  = full replica running at all times
    warm = scaled-down replica always on, scales up on failover
    cold = just backups and snapshots, starts on disaster
    """
    multiplier = DR_MULTIPLIERS.get(dr_type, 1.40)

    return {
        "dr_type": dr_type,
        "multiplier": multiplier,
        "aws_with_dr": round(total_aws * multiplier, 2),
        "azure_with_dr": round(total_azure * multiplier, 2),
        "gcp_with_dr": round(total_gcp * multiplier, 2),
        "aws_dr_extra": round(total_aws * (multiplier - 1), 2),
        "azure_dr_extra": round(total_azure * (multiplier - 1), 2),
        "gcp_dr_extra": round(total_gcp * (multiplier - 1), 2),
        "description": {
            "hot":  "Full live replica in secondary region. Zero downtime on failover.",
            "warm": "Scaled-down replica always running. Scales up in minutes on failover.",
            "cold": "Backups and snapshots only. Takes 30-60 mins to restore on disaster.",
        }[dr_type],
    }
