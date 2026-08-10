from app.security.sanitizer import mask_secret
from app.security.rate_limiter import SimpleRateLimiter
from fastapi import Request
import pytest

def test_secret_masking():
    assert mask_secret("") == "[NOT SET]"
    assert mask_secret("sk-ant-api03-123456789") == "sk-a***6789"
    assert mask_secret("short") == "*****"

def test_rate_limiter():
    limiter = SimpleRateLimiter(max_requests=2, window_seconds=60)
    
    class FakeRequest:
        class FakeClient:
            host = "127.0.0.1"
        client = FakeClient()
        url = type("URL", (), {"path": "/api/generate"})()

    req = FakeRequest()
    
    # First 2 requests pass
    limiter.check_rate_limit(req)
    limiter.check_rate_limit(req)
    
    # 3rd request throws 429
    with pytest.raises(Exception) as exc:
        limiter.check_rate_limit(req)
    assert "429" in str(exc.value) or "Rate limit exceeded" in str(exc.value)
