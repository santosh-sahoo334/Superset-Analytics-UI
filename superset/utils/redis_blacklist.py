import logging
import os

import redis

logger = logging.getLogger(__name__)

_pool = None
PREFIX = "session_blacklist:"
# TTL slightly exceeds PERMANENT_SESSION_LIFETIME (30 min) so entries auto-clean
DEFAULT_TTL = 2100  # 35 minutes


def _get_pool():
    global _pool
    if _pool is None:
        redis_url = (
            f"redis://:{os.getenv('REDIS_PASSWORD')}"
            f"@{os.getenv('REDIS_HOST')}:{os.getenv('REDIS_PORT')}/0"
        )
        _pool = redis.ConnectionPool.from_url(redis_url, decode_responses=True)
    return _pool


def _get_client():
    return redis.StrictRedis(connection_pool=_get_pool())


def blacklist_session(session_id, ttl=DEFAULT_TTL):
    """Add a session ID to the blacklist with automatic expiry."""
    if not session_id:
        logger.warning("Attempted to blacklist empty session_id")
        return
    try:
        _get_client().setex(f"{PREFIX}{session_id}", ttl, "1")
    except Exception as e:
        logger.error("Failed to blacklist session: %s", e)


def is_blacklisted(session_id):
    """Check if a session ID has been blacklisted."""
    if not session_id:
        return False
    try:
        return _get_client().exists(f"{PREFIX}{session_id}") > 0
    except Exception as e:
        logger.error("Failed to check session blacklist: %s", e)
        return False
