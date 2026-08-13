from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app.database import get_session
from app.models import SearchHistory, User
from app.schemas import CurrentWeather, ForecastResponse
from app.services import weather_service
from app.services.weather_service import WeatherAPIError
from app.auth import get_current_user

router = APIRouter(prefix="/weather", tags=["weather"])


@router.get("/current", response_model=CurrentWeather)
async def current_weather(
    city: Optional[str] = Query(None, description="City name, e.g. 'Bengaluru'"),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    session: Session = Depends(get_session),
):
    """
    Look up current weather either by city name or by lat/lon
    (lat/lon is what you'd send from the browser's geolocation API).
    """
    if city:
        try:
            location = await weather_service.geocode_city(city)
        except WeatherAPIError as e:
            raise HTTPException(status_code=404, detail=str(e))
        lat, lon = location["lat"], location["lon"]
    elif lat is None or lon is None:
        raise HTTPException(
            status_code=400, detail="Provide either 'city' or both 'lat' and 'lon'"
        )

    try:
        weather = await weather_service.get_current_weather(lat, lon)
    except WeatherAPIError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return weather


@router.get("/forecast", response_model=ForecastResponse)
async def forecast(
    lat: float = Query(...),
    lon: float = Query(...),
):
    """Hourly (next 24h) and daily (up to 7 days) forecast for a location."""
    try:
        return await weather_service.get_forecast(lat, lon)
    except WeatherAPIError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/log-search", status_code=201)
async def log_search(
    city_name: str,
    country_code: Optional[str],
    latitude: float,
    longitude: float,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Call this from the frontend right after a successful search to record
    it in the logged-in user's history. Kept separate from /current so
    guest searches never hit the database.
    """
    entry = SearchHistory(
        user_id=current_user.id,
        city_name=city_name,
        country_code=country_code,
        latitude=latitude,
        longitude=longitude,
    )
    session.add(entry)
    session.commit()
    return {"status": "logged"}