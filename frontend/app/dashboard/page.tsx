"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import * as api from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import TempGauge from "@/components/TempGauge";

export default function DashboardPage() {
  const { token } = useAuth();
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<api.CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<api.ForecastResponse | null>(null);

  async function runSearch(params: { city?: string; lat?: number; lon?: number }) {
    setLoading(true);
    setError(null);
    try {
      const weather = await api.getCurrentWeather(params);
      setCurrent(weather);

      const fc = await api.getForecast(weather.latitude, weather.longitude);
      setForecast(fc);

      if (token) {
        api
          .logSearch(token, {
            city_name: weather.city,
            country_code: weather.country,
            latitude: weather.latitude,
            longitude: weather.longitude,
          })
          .catch(() => {});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reading failed — try again");
      setCurrent(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!city.trim()) return;
    runSearch({ city: city.trim() });
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation isn't available in this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => runSearch({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setError("Couldn't read your position — search a city instead")
    );
  }

  const chartData =
    forecast?.hourly.map((h) => ({
      time: new Date(h.time).toLocaleTimeString([], { hour: "numeric" }),
      temp: h.temperature_c,
    })) ?? [];

  return (
    <div className="space-y-10">
      {/* search rail */}
      <form onSubmit={handleSubmit} className="animate-fade-up flex flex-col gap-2 sm:flex-row">
        <div
          className="flex flex-1 items-center gap-2.5 rounded-sm border px-4 transition-colors focus-within:border-[var(--brass)]"
          style={{ borderColor: "var(--panel-border)", background: "var(--panel)" }}
        >
          <span className="font-mono-ui text-sm" style={{ color: "var(--text-faint)" }}>
            ⌖
          </span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Locate a station — e.g. Bengaluru"
            className="w-full bg-transparent py-3.5 text-[15px] placeholder:text-[var(--text-faint)] focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="btn btn-primary flex-1 disabled:opacity-40 sm:flex-none">
            {loading ? (
              <span className="loading-dots inline-flex items-center gap-0.5">
                Reading<span>.</span><span>.</span><span>.</span>
              </span>
            ) : (
              "Read"
            )}
          </button>
          <button type="button" onClick={useMyLocation} className="btn btn-ghost flex-1 sm:flex-none">
            ⟡ Here
          </button>
        </div>
      </form>

      {error && (
        <p
          className="animate-fade-up rounded-sm border px-4 py-3 font-mono-ui text-xs"
          style={{ borderColor: "var(--danger)", color: "var(--danger)", background: "rgba(224,112,79,0.08)" }}
        >
          ! {error}
        </p>
      )}

      {current && (
        <section
          className="card-hover animate-fade-up rounded-sm border p-6 sm:p-9"
          style={{ borderColor: "var(--panel-border)", background: "var(--panel)" }}
        >
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              <p
                className="font-mono-ui text-[11px] uppercase tracking-[0.25em]"
                style={{ color: "var(--text-faint)" }}
              >
                Current reading
              </p>
              <h1 className="font-display mt-1.5 text-4xl font-semibold tracking-tight sm:text-6xl">
                {current.city}
                {current.country ? `, ${current.country}` : ""}
              </h1>
              <p className="mt-2.5 font-mono-ui text-[15px]" style={{ color: "var(--text-muted)" }}>
                {current.latitude.toFixed(2)}°, {current.longitude.toFixed(2)}° · feels{" "}
                {Math.round(current.feels_like_c)}°
              </p>
            </div>

            <TempGauge
              tempC={current.temperature_c}
              condition={current.condition}
              iconUrl={`https://openweathermap.org/img/wn/${current.icon}@2x.png`}
            />
          </div>

          <div
            className="stagger-children mt-9 grid grid-cols-2 gap-px overflow-hidden rounded-sm border sm:grid-cols-4"
            style={{ borderColor: "var(--panel-border)" }}
          >
            <Readout label="Humidity" value={`${current.humidity}%`} />
            <Readout label="Wind" value={`${current.wind_speed_kmh}`} unit="km/h" />
            <Readout label="Pressure" value={`${current.pressure_hpa}`} unit="hPa" />
            <Readout
              label="UV index"
              value={
                current.uv_index !== undefined && current.uv_index !== null
                  ? String(current.uv_index)
                  : "—"
              }
            />
          </div>
        </section>
      )}

      {forecast && chartData.length > 0 && (
        <section
          className="card-hover animate-fade-up rounded-sm border p-6 sm:p-9"
          style={{ borderColor: "var(--panel-border)", background: "var(--panel)" }}
        >
          <div className="mb-6 flex items-baseline justify-between">
            <h2
              className="font-mono-ui text-[11px] uppercase tracking-[0.25em]"
              style={{ color: "var(--text-faint)" }}
            >
              24hr trace
            </h2>
            <span className="font-mono-ui text-[11px]" style={{ color: "var(--text-faint)" }}>
              °C
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 6" stroke="var(--panel-border)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-faint)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="var(--text-faint)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}°`}
                  width={34}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-deep)",
                    border: "1px solid var(--panel-border)",
                    borderRadius: 2,
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                  }}
                  labelStyle={{ color: "var(--text-muted)" }}
                  formatter={(value: number) => [`${value}°C`, ""]}
                />
                <Line type="monotone" dataKey="temp" stroke="var(--brass)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {forecast && forecast.daily.length > 0 && (
        <section
          className="card-hover animate-fade-up rounded-sm border p-6 sm:p-9"
          style={{ borderColor: "var(--panel-border)", background: "var(--panel)" }}
        >
          <h2
            className="mb-6 font-mono-ui text-[11px] uppercase tracking-[0.25em]"
            style={{ color: "var(--text-faint)" }}
          >
            7-day manifest
          </h2>
          <div className="stagger-children flex divide-x overflow-x-auto" style={{ borderColor: "var(--panel-border)" }}>
            {forecast.daily.map((d, i) => (
              <div
                key={d.date}
                className="animate-fade-up flex min-w-[100px] flex-1 flex-col items-center gap-2.5 px-3 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--bg-deep)]"
                style={{ borderColor: "var(--panel-border)" }}
              >
                <span
                  className="font-mono-ui text-xs uppercase tracking-wider"
                  style={{ color: "var(--text-faint)" }}
                >
                  {i === 0 ? "Today" : new Date(d.date).toLocaleDateString([], { weekday: "short" })}
                </span>
                <img
                  src={`https://openweathermap.org/img/wn/${d.icon}.png`}
                  alt={d.condition}
                  className="h-9 w-9 opacity-90"
                />
                <span className="font-mono-ui text-[17px]">
                  <span style={{ color: "var(--text-primary)" }}>{Math.round(d.max_temp_c)}°</span>{" "}
                  <span style={{ color: "var(--text-faint)" }}>{Math.round(d.min_temp_c)}°</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {!current && !loading && (
        <div
          className="animate-fade-up flex flex-col items-center gap-3 rounded-sm border border-dashed py-24 text-center"
          style={{ borderColor: "var(--panel-border)" }}
        >
          <span className="font-mono-ui text-3xl" style={{ color: "var(--brass)" }}>
            ⟡
          </span>
          <p className="font-mono-ui text-sm" style={{ color: "var(--text-faint)" }}>
            No station selected — search a city or read your location.
          </p>
        </div>
      )}
    </div>
  );
}

function Readout({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div
      className="animate-fade-up px-4 py-5 transition-colors hover:bg-[#0f1c2c]"
      style={{ background: "var(--bg-deep)" }}
    >
      <p className="font-mono-ui text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--text-faint)" }}>
        {label}
      </p>
      <p className="mt-2 font-mono-ui text-2xl">
        {value}
        {unit && (
          <span className="ml-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
