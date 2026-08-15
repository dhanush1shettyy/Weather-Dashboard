"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as api from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function HistoryPage() {
  const { token, isLoading: authLoading } = useAuth();
  const [history, setHistory] = useState<api.SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .getHistory(token)
      .then(setHistory)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [token, authLoading]);

  async function handleClear() {
    if (!token) return;
    await api.clearHistory(token);
    setHistory([]);
  }

  if (!authLoading && !token) {
    return (
      <p className="py-16 text-center font-mono-ui text-xs" style={{ color: "var(--text-faint)" }}>
        <Link href="/login" className="underline" style={{ color: "var(--ice)" }}>
          Sign in
        </Link>{" "}
        to view your search log.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="font-mono-ui text-[10px] uppercase tracking-[0.25em]" style={{ color: "var(--text-faint)" }}>
            Log
          </p>
          <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight">Search history</h1>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="font-mono-ui text-[10px] uppercase tracking-wider transition"
            style={{ color: "var(--text-faint)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-faint)")}
          >
            Clear log
          </button>
        )}
      </div>

      {loading && <p className="font-mono-ui text-xs" style={{ color: "var(--text-faint)" }}>Loading…</p>}
      {error && <p className="font-mono-ui text-xs" style={{ color: "var(--danger)" }}>! {error}</p>}
      {!loading && history.length === 0 && (
        <p className="font-mono-ui text-xs" style={{ color: "var(--text-faint)" }}>No entries yet.</p>
      )}

      <ul className="divide-y overflow-hidden rounded-sm border" style={{ borderColor: "var(--panel-border)" }}>
        {history.map((h) => (
          <li
            key={h.id}
            className="flex items-center justify-between px-5 py-4"
            style={{ background: "var(--panel)", borderColor: "var(--panel-border)" }}
          >
            <span className="text-sm">
              {h.city_name}
              {h.country_code ? `, ${h.country_code}` : ""}
            </span>
            <span className="font-mono-ui text-[10px]" style={{ color: "var(--text-faint)" }}>
              {new Date(h.searched_at).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
