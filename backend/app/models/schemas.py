from pydantic import BaseModel
from typing import Optional, List, Dict


class EstimateRequest(BaseModel):
    terraform_code: str
    region: Optional[str] = "us-east-1"
    monthly_requests: Optional[int] = 100000
    growth_rate: Optional[float] = 0.1
    enable_dr: Optional[bool] = False


class ProviderPrice(BaseModel):
    service_name: str      # e.g. "EC2 t3.large", "Azure B2ms", "n1-standard-2"
    price: float           # monthly price in USD

class ResourceCost(BaseModel):
    name: str
    resource_type: str
    aws: float
    azure: float
    gcp: float
    best_provider: Optional[str] = None
    provider_details: Optional[Dict[str, ProviderPrice]] = None


class SmellIssue(BaseModel):
    resource: str
    issue: str
    savings: float
    fix: str


class SpotRecommendation(BaseModel):
    resource: str
    safe: bool
    interruption_rate: float
    savings_percent: float


class EstimateResponse(BaseModel):
    resources: List[ResourceCost]
    total_aws: float
    total_azure: float
    total_gcp: float
    cheapest_provider: str
    smell_issues: List[SmellIssue]
    spot_recommendations: List[SpotRecommendation]
    forecast: List[Dict]
    dr_cost: Optional[Dict] = None


class NLRequest(BaseModel):
    description: str


class NLResponse(BaseModel):
    terraform_code: str
    explanation: str
