"""Admin authentication endpoints (login, logout, current session)."""
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import settings
from ..database import get_db
from ..deps import current_admin
from ..security import COOKIE_NAME, create_token, verify_password

router = APIRouter(tags=["auth"])


def _user_out(user: models.AdminUser) -> dict:
    return {"id": user.id, "email": user.email, "name": user.name}


@router.post("/login")
def login(
    payload: schemas.LoginIn, response: Response, db: Session = Depends(get_db)
) -> dict:
    email = payload.email.strip().lower()
    user = (
        db.query(models.AdminUser)
        .filter(func.lower(models.AdminUser.email) == email)
        .first()
    )
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="ایمیل یا رمز عبور نادرست است.")
    token = create_token(user.id)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
        max_age=settings.token_ttl_hours * 3600,
        path="/",
    )
    return {"user": _user_out(user)}


@router.post("/logout")
def logout(response: Response) -> dict:
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"ok": True}


@router.get("/me")
def me(user: models.AdminUser = Depends(current_admin)) -> dict:
    return {"user": _user_out(user)}
