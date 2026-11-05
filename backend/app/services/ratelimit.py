import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request


class RateLimiter:
    """Simple in-memory sliding window limiter (per process). Use Redis if you scale to many workers."""

    def __init__(self, limit: int, window_seconds: int) -> None:
        self.limit = limit
        self.window = window_seconds
        self.hits: dict[str, deque] = defaultdict(deque)

    def check(self, key: str) -> None:
        now = time.monotonic()
        q = self.hits[key]
        while q and now - q[0] > self.window:
            q.popleft()
        if len(q) >= self.limit:
            raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
        q.append(now)


def client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


contact_limiter = RateLimiter(limit=5, window_seconds=3600)
login_limiter = RateLimiter(limit=10, window_seconds=900)


def limit_contact(request: Request) -> None:
    contact_limiter.check(client_ip(request))


def limit_login(request: Request) -> None:
    login_limiter.check(client_ip(request))
