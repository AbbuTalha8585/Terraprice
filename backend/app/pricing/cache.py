import os
import json
import redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
CACHE_TTL = 86400  # 24 hours in seconds

try:
    r = redis.from_url(REDIS_URL, decode_responses=True)
    r.ping()
    CACHE_AVAILABLE = True
except Exception:
    CACHE_AVAILABLE = False
    r = None


def get_cached(key: str):
    """Get a value from Redis cache. Returns None if not found or cache unavailable."""
    if not CACHE_AVAILABLE:
        return None
    try:
        val = r.get(key)
        return json.loads(val) if val else None
    except Exception:
        return None


def set_cached(key: str, value, ttl: int = CACHE_TTL):
    """Store a value in Redis cache with TTL."""
    if not CACHE_AVAILABLE:
        return
    try:
        r.setex(key, ttl, json.dumps(value))
    except Exception:
        pass


def make_key(*parts) -> str:
    """Creates a cache key from parts e.g. make_key('aws', 't3.medium', 'us-east-1')"""
    return ":".join(str(p) for p in parts)
