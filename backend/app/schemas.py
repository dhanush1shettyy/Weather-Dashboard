from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# ---- Auth ----
class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---- Weather ----
class CurrentWeather(BaseModel):
    city: str
    country: Optional[str] = None
    latitude: float
    longitude: float
    temperature_c: float
    feels_like_c: float
    condition: str
    icon: str
    humidity: int
    wind_speed_kmh: float
    pressure_hpa: int
    uv_index: Optional[float] = None
    sunrise: Optional[datetime] = None
    sunset: Optional[datetime] = None


class HourlyForecastItem(BaseModel):
    time: datetime
    temperature_c: float
    condition: str
    icon: str


class DailyForecastItem(BaseModel):
    date: datetime
    min_temp_c: float
    max_temp_c: float
    condition: str
    icon: str


class ForecastResponse(BaseModel):
    hourly: List[HourlyForecastItem]
    daily: List[DailyForecastItem]


# ---- Favorites / History ----
class FavoriteCityCreate(BaseModel):
    city_name: str
    country_code: Optional[str] = None
    latitude: float
    longitude: float


class FavoriteCityRead(BaseModel):
    id: int
    city_name: str
    country_code: Optional[str]
    latitude: float
    longitude: float
    added_at: datetime


class SearchHistoryRead(BaseModel):
    id: int
    city_name: str
    country_code: Optional[str]
    latitude: float
    longitude: float
    searched_at: datetime