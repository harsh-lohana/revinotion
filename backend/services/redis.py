import redis.asyncio as redis

_redis_client = None

async def get_redis() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.from_url("redis://localhost:6739", decode_responses=True)
    return _redis_client