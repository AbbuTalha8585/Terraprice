from fastapi import APIRouter, HTTPException, UploadFile, File
from app.models.schemas import EstimateRequest, EstimateResponse, NLRequest, NLResponse
from app.parser.hcl_parser import parse_terraform
from app.parser.resource_mapper import get_resource_label
from app.parser.variable_resolver import resolve_variables, extract_count
from app.pricing.aws_pricing import get_aws_cost
from app.pricing.azure_pricing import get_azure_cost
from app.pricing.gcp_pricing import get_gcp_cost
from app.features.smell_detector import detect_smells
from app.features.spot_score import calculate_spot_scores
from app.features.forecast import generate_forecast
from app.features.dr_mode import calculate_dr_cost
from app.features.nl_generator import generate_terraform_from_nl
from typing import List

router = APIRouter()


@router.post("/estimate", response_model=EstimateResponse)
async def estimate_cost(request: EstimateRequest):
    """
    Main endpoint — takes Terraform code and returns full cost estimate
    for AWS, Azure, and GCP with all smart features.
    """
    try:
        # Step 1: Parse the Terraform code
        resources = parse_terraform(request.terraform_code)
        if not resources:
            raise HTTPException(status_code=400, detail="No resources found in Terraform code")

        # Step 2: Resolve variables and calculate costs
        resource_costs = []
        total_aws = 0.0
        total_azure = 0.0
        total_gcp = 0.0

        for resource in resources:
            config = resolve_variables(resource.get("config", {}))
            count = extract_count(config)
            rtype = resource["type"]
            rname = resource["name"]

            aws = get_aws_cost(rtype, config, count)
            azure = get_azure_cost(rtype, config, count)
            gcp = get_gcp_cost(rtype, config, count)

            total_aws += aws
            total_azure += azure
            total_gcp += gcp

            resource_costs.append({
                "name": rname,
                "resource_type": get_resource_label(rtype),
                "aws": round(aws, 2),
                "azure": round(azure, 2),
                "gcp": round(gcp, 2),
            })

        # Step 3: Find cheapest provider
        costs = {"AWS": total_aws, "Azure": total_azure, "GCP": total_gcp}
        cheapest = min(costs, key=costs.get)

        # Step 4: Run smart features
        smell_issues = detect_smells(resources)
        spot_recs = calculate_spot_scores(resources)
        forecast = generate_forecast(total_aws, total_azure, total_gcp, request.growth_rate)

        # Step 5: DR mode (optional)
        dr_cost = None
        if request.enable_dr:
            dr_cost = calculate_dr_cost(total_aws, total_azure, total_gcp)

        return EstimateResponse(
            resources=resource_costs,
            total_aws=round(total_aws, 2),
            total_azure=round(total_azure, 2),
            total_gcp=round(total_gcp, 2),
            cheapest_provider=cheapest,
            smell_issues=smell_issues,
            spot_recommendations=spot_recs,
            forecast=forecast,
            dr_cost=dr_cost,
        )

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Estimation failed: {str(e)}")


@router.post("/estimate/upload")
async def estimate_from_file(file: UploadFile = File(...)):
    """Upload a .tf file directly and get cost estimate."""
    if not file.filename.endswith(".tf"):
        raise HTTPException(status_code=400, detail="Only .tf files are supported")
    content = await file.read()
    terraform_code = content.decode("utf-8")
    return await estimate_cost(EstimateRequest(terraform_code=terraform_code))


@router.post("/generate", response_model=NLResponse)
async def generate_from_nl(request: NLRequest):
    """Convert plain English description to Terraform code using AI."""
    if not request.description.strip():
        raise HTTPException(status_code=400, detail="Description cannot be empty")
    result = generate_terraform_from_nl(request.description)
    return NLResponse(**result)


@router.get("/providers")
def get_providers():
    """Returns the list of supported cloud providers."""
    return {
        "providers": ["AWS", "Azure", "GCP"],
        "regions": {
            "AWS": ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"],
            "Azure": ["eastus", "westus2", "westeurope", "southeastasia"],
            "GCP": ["us-central1", "us-east1", "europe-west1", "asia-southeast1"],
        }
    }


@router.get("/resources/supported")
def get_supported_resources():
    """Returns all Terraform resource types that TerraPrice can estimate."""
    return {
        "supported": [
            "aws_instance", "aws_db_instance", "aws_s3_bucket",
            "aws_lb", "aws_nat_gateway", "aws_vpc",
            "azurerm_virtual_machine", "azurerm_sql_database", "azurerm_storage_account",
            "google_compute_instance", "google_sql_database_instance", "google_storage_bucket",
        ]
    }
