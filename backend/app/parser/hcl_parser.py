import hcl2
import json
from typing import Dict, List
from io import StringIO


def parse_terraform(terraform_code: str) -> List[Dict]:
    """
    Reads a Terraform config string and returns a list of all resources found.
    Each resource has: name, type, and all its config properties.
    """
    try:
        tf_file = StringIO(terraform_code)
        parsed = hcl2.load(tf_file)
    except Exception as e:
        raise ValueError(f"Could not parse Terraform file: {str(e)}")

    resources = []

    if "resource" not in parsed:
        return resources

    for resource_block in parsed["resource"]:
        for resource_type, instances in resource_block.items():
            for resource_name, config in instances.items():
                resources.append({
                    "type": resource_type,
                    "name": resource_name,
                    "config": config,
                })

    return resources


def get_resource_summary(resources: List[Dict]) -> Dict:
    """Returns a simple count of each resource type found."""
    summary = {}
    for r in resources:
        rtype = r["type"]
        summary[rtype] = summary.get(rtype, 0) + 1
    return summary
