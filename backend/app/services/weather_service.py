"""
Wraps the OpenWeatherMap API so the rest of the app never touches raw
provider JSON. If you switch providers (e.g. WeatherAPI.com) later,
only this file needs to change - the routers and schemas stay the same.

Uses OpenWeatherMap's free-tier endpoints:
- /weather        -> current conditions
- /forecast       -> 5 day / 3 hour forecast (used for both hourly + daily)
- geocoding API   -> turn a city name into lat/lon

Note: OpenWeatherMap's free tier does not include a clean 7-day daily
forecast or UV index in the main call - those need the paid "One Call"
API. This service derives a daily forecast by bucketing the 3-hourly
data instead, and fetches UV index via a separate free endpoint.
"""

from datetime import datetime, timezone
from typing import Optional

import httpx

from app.config import settings
from app.schemas import (
    CurrentWeather,
    ForecastResponse,
    HourlyForecastItem,
    DailyForecastItem,
)

BASE_URL = settings.weather_api_base_url
API_KEY = settings.weather_api_key


class WeatherAPIError(Exception):
    """Raised when the upstream weather provider fails or the city isn't found."""


async def geocode_city(city_name: str) -> dict:
    """Turn 'Bengaluru' into {lat, lon, name, country}."""
    url = "https://api.openweathermap.org/geo/1.0/direct"
    params = {"q": city_name, "limit": 1, "appid": API_KEY}
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(url, params=params)
    if resp.status_code != 200 or not resp.json():
        raise WeatherAPIError(f"Could not find city '{city_name}'")
    result = resp.json()[0]
    return {
        "lat": result["lat"],
        "lon": result["lon"],
        "name": result["name"],
        "country": result.get("country"),
    }


async def get_current_weather(lat: float, lon: float) -> CurrentWeather:
    params = {"lat": lat, "lon": lon, "appid": API_KEY, "units": "metric"}
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(f"{BASE_URL}/weather", params=params)
    if resp.status_code != 200:
        raise WeatherAPIError("Failed to fetch current weather")
    data = resp.json()

    uv_index = await _get_uv_index(lat, lon)

    return CurrentWeather(
        city=data["name"],
        country=data.get("sys", {}).get("country"),
        latitude=lat,
        longitude=lon,
        temperature_c=data["main"]["temp"],
        feels_like_c=data["main"]["feels_like"],
        condition=data["weather"][0]["description"].title(),
        icon=data["weather"][0]["icon"],
        humidity=data["main"]["humidity"],
        wind_speed_kmh=round(data["wind"]["speed"] * 3.6, 1),  # m/s -> km/h
        pressure_hpa=data["main"]["pressure"],
        uv_index=uv_index,
        sunrise=_to_datetime(data["sys"]["sunrise"]),
        sunset=_to_datetime(data["sys"]["sunset"]),
    )


async def _get_uv_index(lat: float, lon: float) -> Optional[float]:
    """UV index requires a separate call on OpenWeatherMap's free tier."""
    params = {"lat": lat, "lon": lon, "appid": API_KEY}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://api.openweathermap.org/data/2.5/uvi", params=params
            )
        if resp.status_code == 200:
            return resp.json().get("value")
    except httpx.RequestError:
        pass
    return None


async def get_forecast(lat: float, lon: float) -> ForecastResponse:
    params = {"lat": lat, "lon": lon, "appid": API_KEY, "units": "metric"}
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(f"{BASE_URL}/forecast", params=params)
    if resp.status_code != 200:
        raise WeatherAPIError("Failed to fetch forecast")
    data = resp.json()

    hourly = [
        HourlyForecastItem(
            time=_to_datetime(item["dt"]),
            temperature_c=item["main"]["temp"],
            condition=item["weather"][0]["description"].title(),
            icon=item["weather"][0]["icon"],
        )
        for item in data["list"][:8]  # next 24h in 3h steps
    ]

    daily = _bucket_into_daily(data["list"])

    return ForecastResponse(hourly=hourly, daily=daily)


def _bucket_into_daily(entries: list) -> list[DailyForecastItem]:
    """OpenWeatherMap's free forecast is 3-hourly; group into per-day min/max."""
    buckets: dict[str, list[dict]] = {}
    for item in entries:
        day_key = _to_datetime(item["dt"]).strftime("%Y-%m-%d")
        buckets.setdefault(day_key, []).append(item)

    daily_items = []
    for day_key, items in list(buckets.items())[:7]:
        temps = [i["main"]["temp"] for i in items]
        midday = items[len(items) // 2]
        daily_items.append(
            DailyForecastItem(
                date=_to_datetime(items[0]["dt"]),
                min_temp_c=min(temps),
                max_temp_c=max(temps),
                condition=midday["weather"][0]["description"].title(),
                icon=midday["weather"][0]["icon"],
            )
        )
    return daily_items


def _to_datetime(unix_ts: int) -> datetime:
    return datetime.fromtimestamp(unix_ts, tz=timezone.utc)