"""Shared output serializers so public and admin endpoints stay consistent."""
from . import models


def _iso(value):
    return value.isoformat() if value else None


def category_out(category: models.Category, count: int = 0) -> dict:
    return {
        "id": category.id,
        "slug": category.slug,
        "title_fa": category.title_fa,
        "description_fa": category.description_fa,
        "image_url": category.image_url,
        "sort_order": category.sort_order,
        "count": count,
    }


def property_card(prop: models.Property) -> dict:
    """Compact shape used by grids and listing pages."""
    category = prop.category
    images = [img for img in (prop.images or []) if img]
    return {
        "id": prop.id,
        "slug": prop.slug,
        "title_fa": prop.title_fa,
        "category": (
            {"slug": category.slug, "title_fa": category.title_fa} if category else None
        ),
        "transaction_type": prop.transaction_type,
        "city": prop.city,
        "neighborhood": prop.neighborhood,
        "location_note": prop.location_note,
        "area_sqm": prop.area_sqm,
        "land_area_sqm": prop.land_area_sqm,
        "rooms": prop.rooms,
        "floor": prop.floor,
        "price": prop.price,
        "price_on_request": prop.price_on_request,
        "deposit": prop.deposit,
        "monthly_rent": prop.monthly_rent,
        "documentation": prop.documentation,
        "image": prop.featured_image or (images[0] if images else ""),
        "has_virtual_tour": bool(prop.virtual_tour_url),
        "featured": prop.featured,
        "published": prop.published,
        "created_at": _iso(prop.created_at),
    }


def property_detail(prop: models.Property) -> dict:
    """Full shape used by the individual property page and the admin form."""
    images = [img for img in (prop.images or []) if img]
    if prop.featured_image and prop.featured_image not in images:
        images = [prop.featured_image] + images
    return {
        **property_card(prop),
        "description_fa": prop.description_fa,
        "province": prop.province,
        "year_built": prop.year_built,
        "features": [f for f in (prop.features or []) if f],
        "images": images,
        "featured_image": prop.featured_image,
        "floor_plan_url": prop.floor_plan_url,
        "video_url": prop.video_url,
        "virtual_tour_url": prop.virtual_tour_url,
        "latitude": prop.latitude,
        "longitude": prop.longitude,
        "category_slug": prop.category.slug if prop.category else None,
        "updated_at": _iso(prop.updated_at),
    }


def inquiry_out(inquiry: models.Inquiry) -> dict:
    return {
        "id": inquiry.id,
        "kind": inquiry.kind,
        "name": inquiry.name,
        "phone": inquiry.phone,
        "email": inquiry.email,
        "message": inquiry.message,
        "property_id": inquiry.property_id,
        "property_title": inquiry.property_title,
        "status": inquiry.status,
        "created_at": _iso(inquiry.created_at),
    }


def settings_out(row: models.SiteSettings) -> dict:
    fields = (
        "brand_fa",
        "brand_en",
        "phone_1",
        "phone_2",
        "whatsapp",
        "office_code",
        "email",
        "address_fa",
        "hours_fa",
        "instagram",
        "telegram",
        "hero_headline_fa",
        "hero_sub_fa",
        "about_intro_fa",
        "about_body_fa",
        "qeshm_text_fa",
        "hero_image",
        "about_image",
        "qeshm_image",
    )
    return {field: getattr(row, field) for field in fields}
