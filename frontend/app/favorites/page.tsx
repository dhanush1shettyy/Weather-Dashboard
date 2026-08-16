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
      <p className="py-20 text-center font-mono-ui text-sm" style={{ color: "var(--text-faint)" }}>
        <Link href="/login" className="underline" style={{ color: "var(--ice)" }}>
          Sign in
        </Link>{" "}
        to view saved stations.
      </p>
    );
  }

  return (
    <div className="animate-fade-up">
      <p className="font-mono-ui text-[11px] uppercase tracking-[0.3em]" style={{ color: "var(--brass)" }}>
        Saved
      </p>
      <h1 className="font-display mt-2 mb-8 text-4xl font-semibold tracking-tight">Favorite stations</h1>

      {loading && (
        <div className="space-y-px overflow-hidden rounded-sm border" style={{ borderColor: "var(--panel-border)" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-[70px]" style={{ animationDelay: `${i * 90}ms` }} />
          ))}
        </div>
      )}
      {error && <p className="font-mono-ui text-sm" style={{ color: "var(--danger)" }}>! {error}</p>}
      {!loading && favorites.length === 0 && (
        <div
          className="flex flex-col items-center gap-3 rounded-sm border border-dashed py-20 text-center"
          style={{ borderColor: "var(--panel-border)" }}
        >
          <span className="font-mono-ui text-2xl" style={{ color: "var(--brass)" }}>
            ⟡
          </span>
          <p className="font-mono-ui text-base" style={{ color: "var(--text-faint)" }}>No stations saved yet.</p>
        </div>
      )}

      {!loading && favorites.length > 0 && (
        <ul
          className="stagger-children divide-y overflow-hidden rounded-sm border"
          style={{ borderColor: "var(--panel-border)" }}
        >
          {favorites.map((f) => (
            <li
              key={f.id}
              className="row-hover animate-fade-up flex items-center justify-between px-6 py-5 hover:bg-[var(--bg-deep)]"
              style={{ background: "var(--panel)", borderColor: "var(--panel-border)" }}
            >
              <span className="flex items-center gap-2 text-base">
                <span className="row-affordance">→</span>
                {f.city_name}
                {f.country_code ? `, ${f.country_code}` : ""}
              </span>
              <button
                onClick={() => handleRemove(f.id)}
                className="font-mono-ui text-[11px] uppercase tracking-wider transition-colors hover:text-[var(--danger)]"
                style={{ color: "var(--text-faint)" }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
