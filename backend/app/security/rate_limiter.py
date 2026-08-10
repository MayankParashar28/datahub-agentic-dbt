import time
import logging
from collections import defaultdict
from fastapi import Request, HTTPException, status

logger = logging.getLogger(__name__)

class SimpleRateLimiter:
    """
    In-memory Rate Limiter Middleware for FastAPI.
    Limits the number of requests an IP can make within a specified time window.
    Prevents API key quota exhaustion and denial-of-service (DoS) on LLM endpoints.
    """
    def __init__(self, max_requests: int = 30, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)

    def check_rate_limit(self, request: Request):
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        
        # Clean timestamps older than window
        timestamps = [t for t in self.requests[client_ip] if now - t < self.window_seconds]
        self.requests[client_ip] = timestamps

        if len(timestamps) >= self.max_requests:
            logger.warning(f"Rate limit exceeded for IP {client_ip} on endpoint {request.url.path}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Maximum {self.max_requests} requests per {self.window_seconds} seconds."
            )
        
        self.requests[client_ip].append(now)

rate_limiter = SimpleRateLimiter(max_requests=30, window_seconds=60)
