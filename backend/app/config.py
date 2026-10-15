"""Application settings, read from the environment.

Local infrastructure values (database URL) have development defaults that match
docker-compose.base44.yml. External secrets are delivered by the platform to
/run/base44/app.env and are listed last under `env_file:` so they win.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def _env(name: str, default: str = "") -> str:
    value = os.environ.get(name)
    return default if value is None else value


class Settings:
    def __init__(self) -> None:
        self.database_url = _env(
            "DATABASE_URL",
            "postgresql+psycopg://javid:javid_local_dev@db:5432/javid",
        )
        self.secret_key = _env("SECRET_KEY", "insecure-development-secret-change-me")
        self.token_ttl_hours = int(_env("TOKEN_TTL_HOURS", "72"))
        self.cookie_secure = _env("COOKIE_SECURE", "0") == "1"

        self.upload_dir = Path(_env("UPLOAD_DIR", str(BASE_DIR / "uploads")))
        self.max_upload_bytes = int(_env("MAX_UPLOAD_BYTES", str(8 * 1024 * 1024)))
        self.allowed_image_types = {
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif",
            "image/gif",
        }

        # Seeded administrator account (see .env.base44-defaults).
        self.admin_email = _env("ADMIN_EMAIL", "admin@javid.local")
        self.admin_password = _env("ADMIN_PASSWORD", "javid-dev-1404")
        self.admin_name = _env("ADMIN_NAME", "مدیر املاک جاوید")

        self.cors_origins = [
            origin.strip()
            for origin in _env("CORS_ORIGINS", "http://localhost:3000").split(",")
            if origin.strip()
        ]


settings = Settings()
