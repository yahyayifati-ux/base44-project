"""Admin endpoints - every route requires an authenticated administrator."""
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from .. import models, schemas, serializers
from ..config import settings
from ..database import get_db
from ..deps import current_admin
from ..security import make_slug, verify_password, hash_password

router = APIRouter(dependencies=[Depends(current_admin)], tags=["admin"])

_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/gif": ".gif",
}


def _clean_list(values) -> list[str]:
    result: list[str] = []
    for item in values or []:
        text = (item or "").strip()
        if text and text not in result:
            result.append(text)
    return result


def _positive(value):
    if value is None:
        return None
    try:
        number = int(value)
    except (TypeError, ValueError):
        return None
    return number if number >= 0 else None


def _unique_slug(db: Session, base: str, exclude_id: Optional[int] = None) -> str:
    slug = make_slug(base) or "melk"
    candidate = slug
    counter = 2
    while True:
        query = db.query(models.Property).filter(models.Property.slug == candidate)
        if exclude_id:
            query = query.filter(models.Property.id != exclude_id)
        if not query.first():
            return candidate
        candidate = f"{slug}-{counter}"
        counter += 1


def _apply_payload(db: Session, prop: models.Property, payload: schemas.PropertyIn) -> None:
    if payload.category_slug:
        category = (
            db.query(models.Category)
            .filter(models.Category.slug == payload.category_slug)
            .first()
        )
        if not category:
            raise HTTPException(status_code=422, detail="دستهبندی انتخابشده معتبر نیست.")
        prop.category_id = category.id
    else:
        prop.category_id = None

    transaction = payload.transaction_type
    prop.transaction_type = transaction if transaction in models.TRANSACTION_TYPES else "sale"

    prop.title_fa = payload.title_fa.strip()
    prop.slug = _unique_slug(db, payload.slug or payload.title_fa, exclude_id=prop.id)
    prop.description_fa = (payload.description_fa or "").strip()
    prop.province = (payload.province or "هرمزگان").strip()
    prop.city = (payload.city or "قشم").strip()
    prop.neighborhood = (payload.neighborhood or "").strip()
    prop.location_note = (payload.location_note or "").strip()

    prop.area_sqm = _positive(payload.area_sqm)
    prop.land_area_sqm = _positive(payload.land_area_sqm)
    prop.rooms = _positive(payload.rooms)
    prop.floor = _positive(payload.floor)
    prop.year_built = _positive(payload.year_built)
    prop.documentation = (payload.documentation or "").strip()

    price = _positive(payload.price)
    prop.price = price
    prop.price_on_request = True if price is None else bool(payload.price_on_request)
    prop.deposit = _positive(payload.deposit)
    prop.monthly_rent = _positive(payload.monthly_rent)

    prop.features = _clean_list(payload.features)
    images = _clean_list(payload.images)
    prop.images = images
    featured_image = (payload.featured_image or "").strip()
    if featured_image and featured_image not in images:
        images.insert(0, featured_image)
        prop.images = images
    prop.featured_image = featured_image or (images[0] if images else "")

    prop.floor_plan_url = (payload.floor_plan_url or "").strip()
    prop.video_url = (payload.video_url or "").strip()
    prop.virtual_tour_url = (payload.virtual_tour_url or "").strip()
    prop.latitude = (payload.latitude or "").strip()
    prop.longitude = (payload.longitude or "").strip()
    prop.published = bool(payload.published)
    prop.featured = bool(payload.featured)


@router.get("/stats")
def stats(db: Session = Depends(get_db)) -> dict:
    total = db.query(func.count(models.Property.id)).scalar() or 0
    published = (
        db.query(func.count(models.Property.id))
        .filter(models.Property.published.is_(True))
        .scalar()
        or 0
    )
    featured = (
        db.query(func.count(models.Property.id))
        .filter(models.Property.featured.is_(True))
        .scalar()
        or 0
    )
    new_inquiries = (
        db.query(func.count(models.Inquiry.id))
        .filter(models.Inquiry.status == "new")
        .scalar()
        or 0
    )
    inquiries = db.query(func.count(models.Inquiry.id)).scalar() or 0
    return {
        "properties": total,
        "published": published,
        "drafts": total - published,
        "featured": featured,
        "inquiries": inquiries,
        "new_inquiries": new_inquiries,
    }


@router.get("/properties")
def admin_list_properties(
    q: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> dict:
    query = db.query(models.Property)
    if q:
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                models.Property.title_fa.ilike(term),
                models.Property.slug.ilike(term),
                models.Property.neighborhood.ilike(term),
            )
        )
    if status == "published":
        query = query.filter(models.Property.published.is_(True))
    elif status == "draft":
        query = query.filter(models.Property.published.is_(False))
    elif status == "featured":
        query = query.filter(models.Property.featured.is_(True))
    if category:
        sub = (
            db.query(models.Category.id)
            .filter(models.Category.slug == category)
            .scalar_subquery()
        )
        query = query.filter(models.Property.category_id == sub)

    total = query.count()
    items = (
        query.order_by(models.Property.updated_at.desc().nullslast())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {
        "items": [serializers.property_card(p) for p in items],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/properties/{property_id}")
def admin_get_property(property_id: int, db: Session = Depends(get_db)) -> dict:
    prop = db.get(models.Property, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="ملک یافت نشد.")
    return serializers.property_detail(prop)


@router.post("/properties", status_code=201)
def admin_create_property(
    payload: schemas.PropertyIn, db: Session = Depends(get_db)
) -> dict:
    prop = models.Property()
    _apply_payload(db, prop, payload)
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return serializers.property_detail(prop)


@router.put("/properties/{property_id}")
def admin_update_property(
    property_id: int, payload: schemas.PropertyIn, db: Session = Depends(get_db)
) -> dict:
    prop = db.get(models.Property, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="ملک یافت نشد.")
    _apply_payload(db, prop, payload)
    db.commit()
    db.refresh(prop)
    return serializers.property_detail(prop)


@router.delete("/properties/{property_id}")
def admin_delete_property(property_id: int, db: Session = Depends(get_db)) -> dict:
    prop = db.get(models.Property, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="ملک یافت نشد.")
    # Customer inquiries keep their own copy of the property title, so the
    # reference is dropped rather than the lead: deleting a listing must never
    # fail on (or destroy) the inquiries it received.
    db.query(models.Inquiry).filter(models.Inquiry.property_id == property_id).update(
        {models.Inquiry.property_id: None}, synchronize_session=False
    )
    db.delete(prop)
    db.commit()
    return {"ok": True}


@router.post("/uploads", status_code=201)
async def admin_upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> dict:
    if file.content_type not in settings.allowed_image_types:
        raise HTTPException(status_code=422, detail="فقط فایل تصویری (jpg, png, webp) مجاز است.")
    data = await file.read()
    if not data:
        raise HTTPException(status_code=422, detail="فایل خالی است.")
    if len(data) > settings.max_upload_bytes:
        limit_mb = settings.max_upload_bytes // (1024 * 1024)
        raise HTTPException(status_code=422, detail=f"حجم تصویر باید کمتر از {limit_mb} مگابایت باشد.")

    suffix = Path(file.filename or "").suffix.lower()
    extension = _EXTENSIONS.get(file.content_type, "")
    if suffix in {".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"}:
        extension = suffix

    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    name = f"{uuid.uuid4().hex}{extension or '.jpg'}"
    (settings.upload_dir / name).write_bytes(data)
    return {"url": f"/media/{name}"}


@router.get("/inquiries")
def admin_list_inquiries(
    kind: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
) -> dict:
    query = db.query(models.Inquiry)
    if kind:
        query = query.filter(models.Inquiry.kind == kind)
    if status:
        query = query.filter(models.Inquiry.status == status)
    items = query.order_by(models.Inquiry.created_at.desc()).limit(200).all()
    return {"items": [serializers.inquiry_out(i) for i in items]}


@router.patch("/inquiries/{inquiry_id}")
def admin_update_inquiry(
    inquiry_id: int, payload: schemas.InquiryStatusIn, db: Session = Depends(get_db)
) -> dict:
    inquiry = db.get(models.Inquiry, inquiry_id)
    if not inquiry:
        raise HTTPException(status_code=404, detail="درخواست یافت نشد.")
    inquiry.status = payload.status
    db.commit()
    db.refresh(inquiry)
    return serializers.inquiry_out(inquiry)


@router.delete("/inquiries/{inquiry_id}")
def admin_delete_inquiry(inquiry_id: int, db: Session = Depends(get_db)) -> dict:
    inquiry = db.get(models.Inquiry, inquiry_id)
    if not inquiry:
        raise HTTPException(status_code=404, detail="درخواست یافت نشد.")
    db.delete(inquiry)
    db.commit()
    return {"ok": True}


@router.get("/settings")
def admin_get_settings(db: Session = Depends(get_db)) -> dict:
    row = db.get(models.SiteSettings, 1)
    if row is None:
        row = models.SiteSettings(id=1)
        db.add(row)
        db.commit()
        db.refresh(row)
    return serializers.settings_out(row)


@router.put("/settings")
def admin_update_settings(
    payload: schemas.SettingsIn, db: Session = Depends(get_db)
) -> dict:
    row = db.get(models.SiteSettings, 1)
    if row is None:
        row = models.SiteSettings(id=1)
        db.add(row)
    for field, value in payload.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(row, field, value.strip() if isinstance(value, str) else value)
    db.commit()
    db.refresh(row)
    return serializers.settings_out(row)


@router.post("/password")
def admin_change_password(
    payload: schemas.PasswordIn,
    user: models.AdminUser = Depends(current_admin),
    db: Session = Depends(get_db),
) -> dict:
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=422, detail="رمز عبور فعلی نادرست است.")
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"ok": True, "message": "رمز عبور بهروزرسانی شد."}
