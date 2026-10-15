"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .routers import admin, auth, public

app = FastAPI(
    title="JAVID REAL ESTATE API",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploaded property images are served from the same origin (proxied by Vite).
settings.upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(settings.upload_dir)), name="media")

app.include_router(public.router, prefix="/api")
app.include_router(auth.router, prefix="/api/auth")
app.include_router(admin.router, prefix="/api/admin")
