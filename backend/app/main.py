from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import weather, favorites, history, auth

app = FastAPI(
    title="Smart Weather Dashboard API",
    description="Backend for the weather dashboard - proxies OpenWeatherMap and manages favorites/history.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


app.include_router(auth.router)
app.include_router(weather.router)
app.include_router(favorites.router)
app.include_router(history.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}