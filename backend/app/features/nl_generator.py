import os
import re
from typing import Dict

SYSTEM_PROMPT = """You are a Terraform expert. When given a plain English description of 
cloud infrastructure, you generate valid Terraform HCL code using AWS resources.
Only output the raw Terraform code — no markdown fences, no explanation, just the .tf code.
Read the description carefully and match the exact numbers and requirements mentioned."""


def generate_terraform_from_nl(description: str) -> Dict:
    """
    Takes a plain English description and returns Terraform HCL code.
    First tries Anthropic API, then falls back to smart template.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY", "")

    if api_key and api_key.startswith("sk-ant"):
        try:
            import anthropic
            print(f"[NL] Using Anthropic API to generate Terraform...")
            client = anthropic.Anthropic(api_key=api_key)
            message = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2000,
                system=SYSTEM_PROMPT,
                messages=[{
                    "role": "user",
                    "content": f"Generate Terraform code for: {description}"
                }],
            )
            terraform_code = message.content[0].text.strip()
            print(f"[NL] Anthropic API generated code successfully")
            return {
                "terraform_code": terraform_code,
                "explanation": f"AI generated Terraform for: {description}",
            }
        except Exception as e:
            print(f"[NL] Anthropic API failed: {e} — using smart fallback")
    else:
        print(f"[NL] No Anthropic API key found — using smart fallback")

    # Smart fallback — reads the description and generates matching code
    terraform_code = _smart_fallback(description)
    return {
        "terraform_code": terraform_code,
        "explanation": f"Smart template generated for: {description}",
    }


def _extract_number(text: str, default: int = 1) -> int:
    """Extract first number from text."""
    # Check for word numbers first
    word_to_num = {
        "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
        "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    }
    text_lower = text.lower()
    for word, num in word_to_num.items():
        if word in text_lower:
            return num
    # Then check for digits
    numbers = re.findall(r'\d+', text)
    if numbers:
        # Skip very large numbers like 100000 (user count)
        for n in numbers:
            if int(n) <= 20:
                return int(n)
    return default


def _get_instance_type(user_count: int) -> str:
    """Pick instance type based on expected user count."""
    if user_count >= 1000000:
        return "m5.2xlarge"
    elif user_count >= 100000:
        return "m5.xlarge"
    elif user_count >= 10000:
        return "t3.large"
    elif user_count >= 1000:
        return "t3.medium"
    else:
        return "t3.small"


def _smart_fallback(description: str) -> str:
    """
    Reads the description carefully and generates matching Terraform code.
    Extracts: server count, database needs, storage needs, user count.
    """
    desc_lower = description.lower()

    # Extract server/instance count
    server_count = 1
    server_keywords = ["server", "instance", "node", "machine", "vm", "web server", "app server"]
    for keyword in server_keywords:
        if keyword in desc_lower:
            server_count = _extract_number(description, default=2)
            break

    # Extract user count to determine instance size
    user_count = 1000
    user_match = re.search(r'(\d[\d,]*)\s*user', desc_lower)
    if user_match:
        user_count = int(user_match.group(1).replace(",", ""))

    instance_type = _get_instance_type(user_count)

    # Check what services are needed
    needs_database = any(w in desc_lower for w in ["database", "db", "mysql", "postgres", "rds", "sql"])
    needs_storage  = any(w in desc_lower for w in ["storage", "s3", "bucket", "file", "object"])
    needs_lb       = any(w in desc_lower for w in ["load balanc", "alb", "elb", "traffic", "distribute"])
    needs_cache    = any(w in desc_lower for w in ["cache", "redis", "elasticache", "memcache"])
    needs_cdn      = any(w in desc_lower for w in ["cdn", "cloudfront", "content delivery"])

    # Pick DB size based on user count
    db_class = "db.t3.micro"
    db_storage = 20
    if user_count >= 100000:
        db_class = "db.t3.large"
        db_storage = 100
    elif user_count >= 10000:
        db_class = "db.t3.medium"
        db_storage = 50

    # Build Terraform code
    tf = []

    # Web servers
    tf.append(f'''resource "aws_instance" "web" {{
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "{instance_type}"
  count         = {server_count}

  tags = {{
    Name = "web-server-${{count.index + 1}}"
  }}
}}''')

    # Load balancer if needed or if more than 1 server
    if needs_lb or server_count > 1:
        tf.append(f'''
resource "aws_lb" "main" {{
  name               = "terraprice-alb"
  internal           = false
  load_balancer_type = "application"

  tags = {{
    Name = "main-load-balancer"
  }}
}}''')

    # Database if needed
    if needs_database:
        tf.append(f'''
resource "aws_db_instance" "database" {{
  engine              = "mysql"
  instance_class      = "{db_class}"
  allocated_storage   = {db_storage}
  username            = "admin"
  password            = "changeme123"
  skip_final_snapshot = true

  tags = {{
    Name = "main-database"
  }}
}}''')

    # Storage if needed
    if needs_storage:
        tf.append(f'''
resource "aws_s3_bucket" "storage" {{
  bucket = "app-storage-bucket"

  tags = {{
    Name = "app-storage"
  }}
}}''')

    # Cache if needed
    if needs_cache:
        tf.append(f'''
resource "aws_elasticache_cluster" "cache" {{
  cluster_id      = "app-cache"
  engine          = "redis"
  node_type       = "cache.t3.micro"
  num_cache_nodes = 1
}}''')

    return "\n".join(tf)
