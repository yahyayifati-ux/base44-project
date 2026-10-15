"""One-shot schema + seed job (run by the `migrate` compose service).

Creates the tables and seeds only what is genuinely business configuration:
the seven property categories, the site settings row and the administrator
account. It never creates sample listings - real property data is entered by
the administrator in the dashboard.
"""
import os

from sqlalchemy import func, text

from . import models
from .config import settings
from .database import Base, SessionLocal, engine
from .security import hash_password

CATEGORIES = [
    (
        "land",
        "زمین",
        "زمین‌های مسکونی، تجاری و سرمایه‌گذاری در قشم و درگهان",
        "/images/cat-land.jpg",
        1,
    ),
    (
        "house-villa",
        "خانه و ویلا",
        "خانه‌های حیاط‌دار و ویلاهای شخصی در محله‌های قشم",
        "/images/cat-villa.jpg",
        2,
    ),
    (
        "residential-unit",
        "واحد مسکونی",
        "آپارتمان و واحدهای مسکونی آماده سکونت",
        "/images/cat-unit.jpg",
        3,
    ),
    (
        "shop-commercial",
        "مغازه و واحد تجاری",
        "مغازه، واحد تجاری و فضاهای کسب‌وکار در قشم",
        "/images/cat-shop.jpg",
        4,
    ),
    (
        "commercial",
        "املاک تجاری",
        "ساختمان‌ها و فضاهای اداری و تجاری",
        "/images/cat-commercial.jpg",
        5,
    ),
    (
        "investment-projects",
        "پروژه‌های سرمایه‌گذاری",
        "فرصت‌های خرید و مشارکت در پروژه‌های در حال ساخت",
        "/images/cat-investment.jpg",
        6,
    ),
    (
        "rent-mortgage",
        "اجاره و رهن",
        "واحدهای اجاره‌ای و رهنی برای سکونت و کسب‌وکار",
        "/images/cat-rent.jpg",
        7,
    ),
]

SETTINGS_DEFAULTS = {
    "brand_fa": "املاک جاوید",
    "brand_en": "JAVID REAL ESTATE",
    # Contact details shown on the storefront signage of املاک جاوید.
    "phone_1": "0917 303 2009",
    "phone_2": "0917 163 5977",
    "whatsapp": "989173032009",
    "office_code": "264",
    "email": "",
    "address_fa": "جزیره قشم، استان هرمزگان",
    "hours_fa": "",
    "instagram": "",
    "telegram": "",
    "hero_headline_fa": "انتخابی مطمئن برای آینده‌ای ارزشمند",
    "hero_sub_fa": (
        "املاک جاوید در قشم و درگهان کنار شماست تا با شناخت دقیق موقعیت، متراژ و "
        "مدارک هر ملک، تصمیم مطمئن‌تری بگیرید."
    ),
    "about_intro_fa": (
        "املاک جاوید در قشم و درگهان فعالیت می‌کند و تمرکز آن بر معرفی شفاف "
        "فرصت‌های ملکی این جزیره است."
    ),
    "about_body_fa": (
        "ما با شناخت محله‌ها و محدوده‌های قشم به شما کمک می‌کنیم ملک مناسب خود را "
        "با اطلاعات روشن انتخاب کنید: موقعیت، متراژ، مشخصات اعلام‌شده و نوع مدارک، "
        "بدون اغراق و بدون وعده‌های غیرواقعی. کار ما همراهی در مسیر خرید، فروش، "
        "اجاره و سرمایه‌گذاری است."
    ),
    "qeshm_text_fa": (
        "قشم بزرگ‌ترین جزیره خلیج فارس است؛ از بازارها و مجتمع‌های تجاری درگهان تا "
        "محله‌های مسکونی و نوار ساحلی. شناخت همین تفاوت‌های محلی است که انتخاب ملک "
        "را دقیق‌تر می‌کند."
    ),
    "hero_image": "/images/hero.jpg",
    "about_image": "/images/about.jpg",
    "qeshm_image": "/images/qeshm.jpg",
}


MONEY_COLUMNS = (
    ("properties", "price"),
    ("properties", "deposit"),
    ("properties", "monthly_rent"),
)


def ensure_money_columns() -> None:
    """Money columns must be BIGINT.

    Iranian property amounts reach into the billions of toman, which a 32-bit
    integer cannot hold. `create_all` only creates missing tables, so databases
    created before this change need the widening applied explicitly. The
    statement is idempotent.
    """
    with engine.begin() as conn:
        for table, column in MONEY_COLUMNS:
            conn.execute(text(f"ALTER TABLE {table} ALTER COLUMN {column} TYPE BIGINT"))


def ensure_inquiry_property_fk() -> None:
    """`inquiries.property_id` must be ON DELETE SET NULL.

    Deleting a listing has to keep the customer inquiries it received, so the
    database drops the reference instead of refusing the delete. `create_all`
    never alters an existing constraint, so databases created before this change
    need it re-created explicitly. The statements are idempotent.
    """
    with engine.begin() as conn:
        conn.execute(
            text("ALTER TABLE inquiries DROP CONSTRAINT IF EXISTS inquiries_property_id_fkey")
        )
        conn.execute(
            text(
                "ALTER TABLE inquiries ADD CONSTRAINT inquiries_property_id_fkey "
                "FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL"
            )
        )


def seed_categories(db) -> None:
    for slug, title, description, image, order in CATEGORIES:
        existing = db.query(models.Category).filter(models.Category.slug == slug).first()
        if existing:
            continue
        db.add(
            models.Category(
                slug=slug,
                title_fa=title,
                description_fa=description,
                image_url=image,
                sort_order=order,
            )
        )
    db.commit()


def seed_settings(db) -> None:
    row = db.get(models.SiteSettings, 1)
    if row is None:
        row = models.SiteSettings(id=1)
        for field, value in SETTINGS_DEFAULTS.items():
            setattr(row, field, value)
        db.add(row)
        db.commit()


def seed_admin(db) -> None:
    email = settings.admin_email.strip().lower()
    user = (
        db.query(models.AdminUser)
        .filter(func.lower(models.AdminUser.email) == email)
        .first()
    )
    if user is None:
        user = models.AdminUser(
            email=email,
            name=settings.admin_name,
            password_hash=hash_password(settings.admin_password),
        )
        db.add(user)
        db.commit()
        print(f"[migrate] created administrator {email}")
        return
    # Never silently overwrite a password changed from the dashboard.
    if os.environ.get("ADMIN_RESET_PASSWORD") == "1":
        user.password_hash = hash_password(settings.admin_password)
        db.commit()
        print("[migrate] administrator password reset from environment")


def run() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_money_columns()
    ensure_inquiry_property_fk()
    db = SessionLocal()
    try:
        seed_categories(db)
        seed_settings(db)
        seed_admin(db)
    finally:
        db.close()
    print("[migrate] schema and seed data are up to date")


if __name__ == "__main__":
    run()
