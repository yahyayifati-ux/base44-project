"""Authentication dependency guarding every admin endpoint."""
from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from . import models
from .database import get_db
from .security import COOKIE_NAME, decode_token


def current_admin(
    javid_admin: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> models.AdminUser:
    if not javid_admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="برای دسترسی به این بخش باید وارد حساب مدیر شوید.",
        )
    payload = decode_token(javid_admin)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="نشست شما منقضی شده است. دوباره وارد شوید.",
        )
    try:
        admin_id = int(payload.get("sub", ""))
    except (TypeError, ValueError):
        admin_id = None
    admin = db.get(models.AdminUser, admin_id) if admin_id else None
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="حساب مدیر یافت نشد.",
        )
    return admin
