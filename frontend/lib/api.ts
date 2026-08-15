const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function authHeaders(token?: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface CurrentWeather {
  city: string;
  country?: string;
  latitude: number;
  longitude: number;
  temperature_c: number;
  feels_like_c: number;
  condition: string;
  icon: string;
  humidity: number;
  wind_speed_kmh: number;
  pressure_hpa: number;
  uv_index?: number;
  sunrise?: string;
  sunset?: string;
}

export interface HourlyForecastItem {
  time: string;
  temperature_c: number;
  condition: string;
  icon: string;
}

export interface DailyForecastItem {
  date: string;
  min_temp_c: number;
  max_temp_c: number;
  condition: string;
  icon: string;
}

export interface ForecastResponse {
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}

export interface FavoriteCity {
  id: number;
  city_name: string;
  country_code?: string;
  latitude: number;
  longitude: number;
  added_at: string;
}

export interface SearchHistoryItem {
  id: number;
  city_name: string;
  country_code?: string;
  latitude: number;
  longitude: number;
  searched_at: string;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // response wasn't JSON, keep statusText
    }
    throw new ApiError(detail, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function getCurrentWeather(params: {
  city?: string;
  lat?: number;
  lon?: number;
}) {
  const qs = new URLSearchParams();
  if (params.city) qs.set("city", params.city);
  if (params.lat !== undefined) qs.set("lat", String(params.lat));
  if (params.lon !== undefined) qs.set("lon", String(params.lon));
  const res = await fetch(`${API_URL}/weather/current?${qs}`);
  return handleResponse<CurrentWeather>(res);
}

export async function getForecast(lat: number, lon: number) {
  const qs = new URLSearchParams({ lat: String(lat), lon: String(lon) });
  const res = await fetch(`${API_URL}/weather/forecast?${qs}`);
  return handleResponse<ForecastResponse>(res);
}

export async function logSearch(
  token: string,
  params: {
    city_name: string;
    country_code?: string;
    latitude: number;
    longitude: number;
  }
) {
  const qs = new URLSearchParams({
    city_name: params.city_name,
    latitude: String(params.latitude),
    longitude: String(params.longitude),
  });
  if (params.country_code) qs.set("country_code", params.country_code);
  const res = await fetch(`${API_URL}/weather/log-search?${qs}`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function signup(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function login(email: string, password: string) {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  return handleResponse<{ access_token: string; token_type: string }>(res);
}

export async function getFavorites(token: string) {
  const res = await fetch(`${API_URL}/favorites/`, {
    headers: authHeaders(token),
  });
  return handleResponse<FavoriteCity[]>(res);
}

export async function addFavorite(
  token: string,
  favorite: {
    city_name: string;
    country_code?: string;
    latitude: number;
    longitude: number;
  }
) {
  const res = await fetch(`${API_URL}/favorites/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(favorite),
  });
  return handleResponse<FavoriteCity>(res);
}

export async function removeFavorite(token: string, id: number) {
  const res = await fetch(`${API_URL}/favorites/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function getHistory(token: string, limit = 20) {
  const res = await fetch(`${API_URL}/history/?limit=${limit}`, {
    headers: authHeaders(token),
  });
  return handleResponse<SearchHistoryItem[]>(res);
}

export async function clearHistory(token: string) {
  const res = await fetch(`${API_URL}/history/`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export { ApiError };
