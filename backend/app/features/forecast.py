from typing import List, Dict


def generate_forecast(
    total_aws: float,
    total_azure: float,
    total_gcp: float,
    growth_rate: float = 0.10,
    months: int = 12,
) -> List[Dict]:
    """
    Projects monthly costs for 12 months based on traffic growth rate.
    growth_rate = 0.10 means costs grow 10% each month.
    """
    forecast = []

    month_names = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ]

    aws_cost = total_aws
    azure_cost = total_azure
    gcp_cost = total_gcp

    for i in range(months):
        multiplier = (1 + growth_rate) ** i
        forecast.append({
            "month": month_names[i % 12],
            "month_number": i + 1,
            "aws": round(total_aws * multiplier, 2),
            "azure": round(total_azure * multiplier, 2),
            "gcp": round(total_gcp * multiplier, 2),
        })

    return forecast


def get_forecast_summary(forecast: List[Dict]) -> Dict:
    """Returns year-end costs and total annual spend."""
    last = forecast[-1]
    total_aws = sum(m["aws"] for m in forecast)
    total_azure = sum(m["azure"] for m in forecast)
    total_gcp = sum(m["gcp"] for m in forecast)

    return {
        "year_end_aws": last["aws"],
        "year_end_azure": last["azure"],
        "year_end_gcp": last["gcp"],
        "annual_aws": round(total_aws, 2),
        "annual_azure": round(total_azure, 2),
        "annual_gcp": round(total_gcp, 2),
    }
