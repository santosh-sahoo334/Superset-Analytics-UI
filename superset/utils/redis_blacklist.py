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


# ---------------------------------------------------------------------------
# User-level revocation (for OIDC Backchannel Logout)
# ---------------------------------------------------------------------------

USER_REVOKE_PREFIX = "user_revoked:"
# TTL exceeds max session lifetime so entries auto-clean
USER_REVOKE_TTL = 86400  # 24 hours


def revoke_user_sessions(user_id: int, ttl: int = USER_REVOKE_TTL) -> None:
    """
    Revoke all active sessions for a Superset user.

    Stores the current timestamp as the revocation time. The before_request
    hook `check_user_revocation` in app.py reads this flag and forces logout.
    Called by the OIDC backchannel logout endpoint when Keycloak notifies us.
    """
    import time
    try:
        _get_client().setex(f"{USER_REVOKE_PREFIX}{user_id}", ttl, str(time.time()))
        logger.info("[redis_blacklist] Revoked sessions for user_id=%s", user_id)
    except Exception as e:
        logger.error("[redis_blacklist] Failed to revoke sessions for user_id=%s: %s", user_id, e)


def clear_user_revocation(user_id: int) -> None:
    """Remove the revocation flag so the user can log in again."""
    try:
        _get_client().delete(f"{USER_REVOKE_PREFIX}{user_id}")
        logger.info("[redis_blacklist] Cleared revocation for user_id=%s", user_id)
    except Exception as e:
        logger.error("[redis_blacklist] Failed to clear revocation for user_id=%s: %s", user_id, e)


def is_user_revoked(user_id: int) -> bool:
    """Return True if the user's sessions have been revoked via backchannel logout."""
    try:
        return _get_client().exists(f"{USER_REVOKE_PREFIX}{user_id}") == 1
    except Exception as e:
        logger.error("[redis_blacklist] Failed to check user revocation for user_id=%s: %s", user_id, e)
        return False  # Fail open — don't block legitimate users on Redis errors
