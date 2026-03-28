import re
from typing import Dict, Any


def resolve_variables(config: Dict, variables: Dict = {}) -> Dict:
    """
    Replaces ${var.xxx} and var.xxx references in config with actual values.
    Falls back to sensible defaults if variable not found.
    """
    DEFAULT_VALUES = {
        "instance_type":    "t3.medium",
        "instance_class":   "db.t3.micro",
        "storage_size":     "100",
        "region":           "us-east-1",
        "count":            "1",
        "engine":           "mysql",
    }

    def resolve_value(val: Any) -> Any:
        if isinstance(val, str):
            # Replace ${var.xxx} pattern
            pattern = r'\$\{var\.(\w+)\}'
            matches = re.findall(pattern, val)
            for match in matches:
                replacement = variables.get(match) or DEFAULT_VALUES.get(match, match)
                val = val.replace(f"${{var.{match}}}", str(replacement))
            return val
        elif isinstance(val, dict):
            return {k: resolve_value(v) for k, v in val.items()}
        elif isinstance(val, list):
            return [resolve_value(i) for i in val]
        return val

    return resolve_value(config)


def extract_count(config: Dict) -> int:
    """Returns how many instances of a resource are being created."""
    count = config.get("count", 1)
    try:
        return int(count)
    except (ValueError, TypeError):
        return 1
