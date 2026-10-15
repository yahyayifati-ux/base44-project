"""Public read/write endpoints used by the customer-facing website."""
import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from .. import models, schemas, serializers
from ..database import get_db
from ..security import normalize_digits

router = APIRouter(tags=["public"])

SORTS = {
    "newest": "newest",
    "oldest": "oldest",
    "price_asc": "price_asc",
    "price_desc": "price_desc",
    "area_desc": "area_desc",
}


def _settings_row(db: Session) -> models.SiteSettings:
    row = db.get(models.SiteSettings, 1)
    if row is None:
        row = models.SiteSettings(id=1)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


@router.get("/settings")
def public_settings(db: Session = Depends(get_db)) -> dict:
    return serializers.settings_out(_settings_row(db))


@router.get("/categories")
def list_categories(db: Session = Depends(get_db)) -> list[dict]:
    """Categories with counts computed from actually published listings."""
    counts = dict(
        db.query(models.Property.category_id, func.count(models.Property.id))
        .filter(models.Property.published.is_(True))
        .group_by(models.Property.category_id)
        .all()
    )
    categories = (
        db.query(models.Category).order_by(models.Category.sort_order).all()
    )
    return [serializers.category_out(c, counts.get(c.id, 0)) for c in categories]


def _apply_filters(query, **kwargs):
    if kwargs.get("transaction"):
        query = query.filter(models.Property.transaction_type == kwargs["transaction"])
    if kwargs.get("category"):
        sub = (
            query.session.query(models.Category.id)
            .filter(models.Category.slug == kwargs["category"])
            .scalar_subquery()
        )
        query = query.filter(models.Property.category_id == sub)
    if kwargs.get("q"):
        term = f"%{kwargs['q'].strip()}%"
        query = query.filter(
            or_(
                models.Property.title_fa.ilike(term),
                models.Property.description_fa.ilike(term),
                models.Property.neighborhood.ilike(term),
                models.Property.location_note.ilike(term),
                models.Property.city.ilike(term),
            )
        )
    if kwargs.get("location"):
        term = f"%{kwargs['location'].strip()}%"
        query = query.filter(
            or_(
                models.Property.neighborhood.ilike(term),
                models.Property.city.ilike(term),
                models.Property.location_note.ilike(term),
            )
        )
    if kwargs.get("min_price") is not None or kwargs.get("max_price") is not None:
        query = query.filter(
            models.Property.price.isnot(None), models.Property.price_on_request.is_(False)
        )
        if kwargs.get("min_price") is not None:
            query = query.filter(models.Property.price >= kwargs["min_price"])
        if kwargs.get("max_price") is not None:
            query = query.filter(models.Property.price <= kwargs["max_price"])
    if kwargs.get("min_area") is not None:
        query = query.filter(models.Property.area_sqm >= kwargs["min_area"])
    if kwargs.get("max_area") is not None:
        query = query.filter(models.Property.area_sqm <= kwargs["max_area"])
    if kwargs.get("rooms") is not None:
        query = query.filter(models.Property.rooms >= kwargs["rooms"])
    if kwargs.get("floor") is not None:
        query = query.filter(models.Property.floor == kwargs["floor"])
    if kwargs.get("documentation"):
        query = query.filter(
            models.Property.documentation.ilike(f"%{kwargs['documentation'].strip()}%")
        )
    if kwargs.get("featured") is not None:
        query = query.filter(models.Property.featured.is_(kwargs["featured"]))
    return query


def _order_by(query, sort: str):
    if sort == "oldest":
        return query.order_by(models.Property.created_at.asc())
    if sort == "price_asc":
        return query.order_by(models.Property.price.asc().nulls_last())
    if sort == "price_desc":
        return query.order_by(models.Property.price.desc().nulls_last())
    if sort == "area_desc":
        return query.order_by(models.Property.area_sqm.desc().nulls_last())
    return query.order_by(
        models.Property.featured.desc(), models.Property.created_at.desc()
    )


@router.get("/properties")
def list_properties(
    transaction: Optional[str] = None,
    category: Optional[str] = None,
    q: Optional[str] = None,
    location: Optional[str] = None,
    documentation: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    min_area: Optional[int] = None,
    max_area: Optional[int] = None,
    rooms: Optional[int] = None,
    floor: Optional[int] = None,
    featured: Optional[bool] = None,
    sort: str = "newest",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=9, ge=1, le=48),
    db: Session = Depends(get_db),
) -> dict:
    query = db.query(models.Property).filter(models.Property.published.is_(True))
    query = _apply_filters(
        query,
        transaction=transaction,
        category=category,
        q=q,
        location=location,
        documentation=documentation,
        min_price=min_price,
        max_price=max_price,
        min_area=min_area,
        max_area=max_area,
        rooms=rooms,
        floor=floor,
        featured=featured,
    )
    total = query.count()
    sort_key = sort if sort in SORTS else "newest"
    items = (
        _order_by(query, sort_key)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {
        "items": [serializers.property_card(p) for p in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": max(1, math.ceil(total / page_size)) if total else 0,
        "sort": sort_key,
    }


@router.get("/properties/{slug}")
def get_property(slug: str, db: Session = Depends(get_db)) -> dict:
    prop = (
        db.query(models.Property)
        .filter(models.Property.slug == slug, models.Property.published.is_(True))
        .first()
    )
    if not prop:
        raise HTTPException(status_code=404, detail="این ملک یافت نشد یا منتشر نشده است.")

    related_query = db.query(models.Property).filter(
        models.Property.published.is_(True), models.Property.id != prop.id
    )
    if prop.category_id:
        related_query = related_query.filter(models.Property.category_id == prop.category_id)
    related = related_query.order_by(models.Property.created_at.desc()).limit(3).all()

    return {
        **serializers.property_detail(prop),
        "related": [serializers.property_card(p) for p in related],
    }


@router.post("/inquiries", status_code=201)
def create_inquiry(payload: schemas.InquiryIn, db: Session = Depends(get_db)) -> dict:
    kind = payload.kind if payload.kind in models.INQUIRY_KINDS else "contact"
    phone = normalize_digits(payload.phone).strip()
    digits_only = "".join(ch for ch in phone if ch.isdigit())
    if len(digits_only) < 8:
        raise HTTPException(status_code=422, detail="شماره تماس معتبر نیست.")

    property_title = ""
    if payload.property_id:
        prop = db.get(models.Property, payload.property_id)
        if not prop:
            raise HTTPException(status_code=404, detail="ملک مورد نظر یافت نشد.")
        property_title = prop.title_fa

    inquiry = models.Inquiry(
        kind=kind,
        name=payload.name.strip(),
        phone=phone,
        email=(payload.email or "").strip(),
        message=(payload.message or "").strip(),
        property_id=payload.property_id if property_title else None,
        property_title=property_title,
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    return {
        "ok": True,
        "id": inquiry.id,
        "message": "درخواست شما ثبت شد. کارشناسان املاک جاوید با شما تماس میگیرند.",
    }
