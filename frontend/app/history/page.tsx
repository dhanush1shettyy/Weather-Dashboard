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
      <p className="py-20 text-center font-mono-ui text-sm" style={{ color: "var(--text-faint)" }}>
        <Link href="/login" className="underline" style={{ color: "var(--ice)" }}>
          Sign in
        </Link>{" "}
        to view your search log.
      </p>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-mono-ui text-[11px] uppercase tracking-[0.3em]" style={{ color: "var(--brass)" }}>
            Log
          </p>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight">Search history</h1>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="font-mono-ui text-[11px] uppercase tracking-wider transition-colors hover:text-[var(--danger)]"
            style={{ color: "var(--text-faint)" }}
          >
            Clear log
          </button>
        )}
      </div>

      {loading && (
        <div className="space-y-px overflow-hidden rounded-sm border" style={{ borderColor: "var(--panel-border)" }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-[70px]" style={{ animationDelay: `${i * 90}ms` }} />
          ))}
        </div>
      )}
      {error && <p className="font-mono-ui text-sm" style={{ color: "var(--danger)" }}>! {error}</p>}
      {!loading && history.length === 0 && (
        <div
          className="flex flex-col items-center gap-3 rounded-sm border border-dashed py-20 text-center"
          style={{ borderColor: "var(--panel-border)" }}
        >
          <span className="font-mono-ui text-2xl" style={{ color: "var(--brass)" }}>
            ⏱
          </span>
          <p className="font-mono-ui text-base" style={{ color: "var(--text-faint)" }}>No entries yet.</p>
        </div>
      )}

      {!loading && history.length > 0 && (
        <ul
          className="stagger-children divide-y overflow-hidden rounded-sm border"
          style={{ borderColor: "var(--panel-border)" }}
        >
          {history.map((h) => (
            <li
              key={h.id}
              className="row-hover animate-fade-up flex items-center justify-between px-6 py-5 hover:bg-[var(--bg-deep)]"
              style={{ background: "var(--panel)", borderColor: "var(--panel-border)" }}
            >
              <span className="flex items-center gap-2 text-base">
                <span className="row-affordance">→</span>
                {h.city_name}
                {h.country_code ? `, ${h.country_code}` : ""}
              </span>
              <span className="font-mono-ui text-[12px]" style={{ color: "var(--text-faint)" }}>
                {new Date(h.searched_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
