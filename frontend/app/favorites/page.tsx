"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as api from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function FavoritesPage() {
  const { token, isLoading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<api.FavoriteCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .getFavorites(token)
      .then(setFavorites)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [token, authLoading]);

  async function handleRemove(id: number) {
    if (!token) return;
    await api.removeFavorite(token, id);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }

  if (!authLoading && !token) {
    return (
      <p className="py-16 text-center font-mono-ui text-xs" style={{ color: "var(--text-faint)" }}>
        <Link href="/login" className="underline" style={{ color: "var(--ice)" }}>
          Sign in
        </Link>{" "}
        to view saved stations.
      </p>
    );
  }

  return (
    <div>
      <p className="font-mono-ui text-[10px] uppercase tracking-[0.25em]" style={{ color: "var(--text-faint)" }}>
        Saved
      </p>
      <h1 className="font-display mt-1 mb-6 text-2xl font-semibold tracking-tight">Favorite stations</h1>

      {loading && <p className="font-mono-ui text-xs" style={{ color: "var(--text-faint)" }}>Loading…</p>}
      {error && <p className="font-mono-ui text-xs" style={{ color: "var(--danger)" }}>! {error}</p>}
      {!loading && favorites.length === 0 && (
        <p className="font-mono-ui text-xs" style={{ color: "var(--text-faint)" }}>
          No stations saved yet.
        </p>
      )}

      <ul className="divide-y overflow-hidden rounded-sm border" style={{ borderColor: "var(--panel-border)" }}>
        {favorites.map((f) => (
          <li
            key={f.id}
            className="flex items-center justify-between px-5 py-4"
            style={{ background: "var(--panel)", borderColor: "var(--panel-border)" }}
          >
            <span className="text-sm">
              {f.city_name}
              {f.country_code ? `, ${f.country_code}` : ""}
            </span>
            <button
              onClick={() => handleRemove(f.id)}
              className="font-mono-ui text-[10px] uppercase tracking-wider transition"
              style={{ color: "var(--text-faint)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-faint)")}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
