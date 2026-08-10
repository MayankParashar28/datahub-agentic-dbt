"""
Security Utility Module.
Provides helper functions for masking sensitive credentials (API keys, tokens) in logs and error tracebacks.
"""

def mask_secret(secret: str, show_chars: int = 4) -> str:
    """
    Mask a secret string so it can be safely logged without exposing credentials.
    Example: 'sk-ant-api03-123456789' -> 'sk-a***6789'
    """
    if not secret:
        return "[NOT SET]"
    if len(secret) <= show_chars * 2:
        return "*" * len(secret)
    return f"{secret[:show_chars]}***{secret[-show_chars:]}"
