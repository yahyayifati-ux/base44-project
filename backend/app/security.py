"""Password hashing, session tokens and text helpers (no external services)."""
import hashlib
import hmac
import re
import secrets
from datetime import datetime, timedelta, timezone

import jwt

from .config import settings

COOKIE_NAME = "javid_admin"
_ALGORITHM = "HS256"
_ITERATIONS = 210_000

_PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹"
_ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩"
_ASCII_DIGITS = "0123456789"


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), _ITERATIONS
    )
    return f"pbkdf2_sha256${_ITERATIONS}${salt}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algorithm, iterations, salt, digest = stored.split("$")
    except (ValueError, AttributeError):
        return False
    if algorithm != "pbkdf2_sha256":
        return False
    computed = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), int(iterations)
    )
    return hmac.compare_digest(computed.hex(), digest)


def create_token(subject: str | int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(subject),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=settings.token_ttl_hours)).timestamp()),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=_ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[_ALGORITHM])
    except jwt.PyJWTError:
        return None


def normalize_digits(value: str) -> str:
    """Convert Persian/Arabic-Indic digits to ASCII so phone numbers validate."""
    if not value:
        return ""
    table = str.maketrans(_PERSIAN_DIGITS + _ARABIC_DIGITS, _ASCII_DIGITS * 2)
    return value.translate(table)


def make_slug(value: str) -> str:
    """Build a URL-safe slug, keeping Persian letters (they encode fine in URLs)."""
    text = normalize_digits(value or "").strip().lower()
    text = re.sub(r"[^\w\u200c]+", "-", text, flags=re.UNICODE)
    text = re.sub(r"-{2,}", "-", text).strip("-")
    return text[:140]
