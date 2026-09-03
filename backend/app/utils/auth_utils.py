import hashlib
import hmac
import base64
import json
import time

SECRET_KEY = "ner-logistics-intelligence-secure-hackathon-key-2026"

def hash_password(password: str) -> str:
    """Hash password using SHA-256 with salt."""
    salt = "ner_secure_salt_2026"
    return hashlib.sha256((password + salt).encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash, supporting both raw and hashed comparisons."""
    if plain_password == hashed_password:
        return True
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict) -> str:
    """Create a lightweight signed token."""
    payload = data.copy()
    payload["exp"] = int(time.time()) + 86400 * 7  # 7 days
    payload_bytes = json.dumps(payload).encode("utf-8")
    b64_payload = base64.urlsafe_b64encode(payload_bytes).decode("utf-8")
    
    signature = hmac.new(
        SECRET_KEY.encode("utf-8"),
        b64_payload.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    
    return f"{b64_payload}.{signature}"

def verify_token(token: str) -> dict:
    """Verify and decode lightweight token."""
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        b64_payload, signature = parts
        expected_sig = hmac.new(
            SECRET_KEY.encode("utf-8"),
            b64_payload.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected_sig):
            return None
        
        payload_bytes = base64.urlsafe_b64decode(b64_payload.encode("utf-8"))
        payload = json.loads(payload_bytes.decode("utf-8"))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None
