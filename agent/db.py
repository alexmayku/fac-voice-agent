import os
import logging
from typing import Optional

import asyncpg

logger = logging.getLogger(__name__)

_pool: Optional[asyncpg.Pool] = None


async def init_db() -> None:
    """Create connection pool and ensure tables exist. Idempotent."""
    global _pool
    if _pool is not None:
        return

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        logger.warning("DATABASE_URL not set — database features disabled")
        return

    try:
        _pool = await asyncpg.create_pool(database_url, min_size=1, max_size=5)

        async with _pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    mode TEXT NOT NULL CHECK (mode IN ('planning', 'review')),
                    summary TEXT NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                CREATE INDEX IF NOT EXISTS idx_sessions_user
                    ON sessions(user_id, created_at DESC);

                CREATE TABLE IF NOT EXISTS notes (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    note TEXT NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
            """)

        logger.info("Database initialized")
    except Exception as e:
        logger.error("Failed to connect to database: %s", e)
        _pool = None


async def close_db() -> None:
    """Close the connection pool."""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


async def save_session(user_id: str, mode: str, summary: str) -> Optional[int]:
    """Save a session summary. Returns the session id, or None if DB unavailable."""
    if _pool is None:
        logger.warning("Database not available — session not saved")
        return None
    row = await _pool.fetchrow(
        "INSERT INTO sessions (user_id, mode, summary) VALUES ($1, $2, $3) RETURNING id",
        user_id, mode, summary,
    )
    return row["id"]


async def get_latest_planning_summary(user_id: str) -> Optional[str]:
    """Get the most recent planning session summary for a user."""
    if _pool is None:
        return None
    row = await _pool.fetchrow(
        "SELECT summary FROM sessions WHERE user_id = $1 AND mode = 'planning' "
        "ORDER BY created_at DESC LIMIT 1",
        user_id,
    )
    return row["summary"] if row else None


async def get_sessions(user_id: str, limit: int = 20) -> list[dict]:
    """Get recent sessions for a user."""
    if _pool is None:
        return []
    rows = await _pool.fetch(
        "SELECT id, mode, summary, created_at FROM sessions "
        "WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2",
        user_id, limit,
    )
    return [dict(r) for r in rows]


async def save_note(user_id: str, note: str) -> Optional[int]:
    """Save a note. Returns the note id, or None if DB unavailable."""
    if _pool is None:
        logger.warning("Database not available — note not saved")
        return None
    row = await _pool.fetchrow(
        "INSERT INTO notes (user_id, note) VALUES ($1, $2) RETURNING id",
        user_id, note,
    )
    return row["id"]


async def get_notes(user_id: str) -> list[dict]:
    """Get recent notes for a user."""
    if _pool is None:
        return []
    rows = await _pool.fetch(
        "SELECT id, note, created_at FROM notes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
        user_id,
    )
    return [dict(r) for r in rows]
