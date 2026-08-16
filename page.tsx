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
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div
          className="flex flex-1 items-center gap-2 rounded-sm border px-4"
          style={{ borderColor: "var(--panel-border)", background: "var(--panel)" }}
        >
          <span className="font-mono-ui text-xs" style={{ color: "var(--text-faint)" }}>
            ⌖
          </span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Locate a station — e.g. Bengaluru"
            className="w-full bg-transparent py-3 text-sm placeholder:text-[var(--text-faint)] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-sm border px-5 font-mono-ui text-xs uppercase tracking-wider transition disabled:opacity-40"
          style={{ borderColor: "var(--brass)", color: "var(--brass)" }}
        >
          {loading ? "Reading…" : "Read"}
        </button>
        <button
          type="button"
          onClick={useMyLocation}
          className="rounded-sm border px-4 font-mono-ui text-xs uppercase tracking-wider transition"
          style={{ borderColor: "var(--panel-border)", color: "var(--text-muted)" }}
        >
          ⟡ Here
        </button>
      </form>

      {error && (
        <p
          className="rounded-sm border px-4 py-3 font-mono-ui text-xs"
          style={{ borderColor: "var(--danger)", color: "var(--danger)", background: "rgba(224,112,79,0.08)" }}
        >
          ! {error}
        </p>
      )}

      {current && (
        <section
          className="rounded-sm border p-6 sm:p-8"
          style={{ borderColor: "var(--panel-border)", background: "var(--panel)" }}
        >
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              <p
                className="font-mono-ui text-[10px] uppercase tracking-[0.25em]"
                style={{ color: "var(--text-faint)" }}
              >
                Current reading
              </p>
              <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">
                {current.city}
                {current.country ? `, ${current.country}` : ""}
              </h1>
              <p className="mt-1 font-mono-ui text-xs" style={{ color: "var(--text-muted)" }}>
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

          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-sm border sm:grid-cols-4" style={{ borderColor: "var(--panel-border)" }}>
            <Readout label="Humidity" value={`${current.humidity}%`} />
            <Readout label="Wind" value={`${current.wind_speed_kmh}`} unit="km/h" />
            <Readout label="Pressure" value={`${current.pressure_hpa}`} unit="hPa" />
            <Readout
              label="UV index"
              value={current.uv_index !== undefined && current.uv_index !== null ? String(current.uv_index) : "—"}
            />
          </div>
        </section>
      )}

      {forecast && chartData.length > 0 && (
        <section
          className="rounded-sm border p-6 sm:p-8"
          style={{ borderColor: "var(--panel-border)", background: "var(--panel)" }}
        >
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="font-mono-ui text-[10px] uppercase tracking-[0.25em]" style={{ color: "var(--text-faint)" }}>
              24hr trace
            </h2>
            <span className="font-mono-ui text-[10px]" style={{ color: "var(--text-faint)" }}>
              °C
            </span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 6" stroke="var(--panel-border)" vertical={false} />
                <XAxis
                  dataKey="time"
                  stroke="var(--text-faint)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--text-faint)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}°`}
                  width={32}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-deep)",
                    border: "1px solid var(--panel-border)",
                    borderRadius: 2,
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                  }}
                  labelStyle={{ color: "var(--text-muted)" }}
                  formatter={(value: number) => [`${value}°C`, ""]}
                />
                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="var(--brass)"
                  strokeWidth={1.75}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {forecast && forecast.daily.length > 0 && (
        <section
          className="rounded-sm border p-6 sm:p-8"
          style={{ borderColor: "var(--panel-border)", background: "var(--panel)" }}
        >
          <h2 className="mb-5 font-mono-ui text-[10px] uppercase tracking-[0.25em]" style={{ color: "var(--text-faint)" }}>
            7-day manifest
          </h2>
          <div className="flex divide-x overflow-x-auto" style={{ borderColor: "var(--panel-border)" }}>
            {forecast.daily.map((d, i) => (
              <div
                key={d.date}
                className="flex min-w-[92px] flex-1 flex-col items-center gap-2 px-3 py-2"
                style={{ borderColor: "var(--panel-border)" }}
              >
                <span className="font-mono-ui text-[10px] uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
                  {i === 0
                    ? "Today"
                    : new Date(d.date).toLocaleDateString([], { weekday: "short" })}
                </span>
                <img
                  src={`https://openweathermap.org/img/wn/${d.icon}.png`}
                  alt={d.condition}
                  className="h-8 w-8 opacity-90"
                />
                <span className="font-mono-ui text-sm">
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
          className="flex flex-col items-center gap-3 rounded-sm border border-dashed py-20 text-center"
          style={{ borderColor: "var(--panel-border)" }}
        >
          <span className="font-mono-ui text-2xl" style={{ color: "var(--brass)" }}>
            ⟡
          </span>
          <p className="font-mono-ui text-xs" style={{ color: "var(--text-faint)" }}>
            No station selected — search a city or read your location.
          </p>
        </div>
      )}
    </div>
  );
}

function Readout({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="px-4 py-4" style={{ background: "var(--bg-deep)" }}>
      <p className="font-mono-ui text-[9px] uppercase tracking-[0.2em]" style={{ color: "var(--text-faint)" }}>
        {label}
      </p>
      <p className="mt-1.5 font-mono-ui text-lg">
        {value}
        {unit && (
          <span className="ml-1 text-xs" style={{ color: "var(--text-muted)" }}>
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
