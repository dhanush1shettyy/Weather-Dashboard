"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export default function NavBar() {
  const { token, logout, isLoading } = useAuth();

  return (
    <header
      className="sticky top-0 z-10 border-b"
      style={{ background: "var(--bg-deep)", borderColor: "var(--panel-border)" }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full border font-mono-ui text-[10px]"
            style={{ borderColor: "var(--brass)", color: "var(--brass)" }}
          >
            ⟡
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight">
            STATION
          </span>
          <span
            className="hidden font-mono-ui text-[10px] uppercase tracking-[0.2em] sm:inline"
            style={{ color: "var(--text-faint)" }}
          >
            / weather dashboard
          </span>
        </Link>

        <nav className="flex items-center gap-5 font-mono-ui text-xs uppercase tracking-wider">
          {!isLoading && token && (
            <>
              <Link href="/favorites" className="transition hover:text-[var(--brass)]">
                Favorites
              </Link>
              <Link href="/history" className="transition hover:text-[var(--brass)]">
                History
              </Link>
              <button
                onClick={logout}
                className="rounded-sm border px-3 py-1.5 transition hover:border-[var(--brass)] hover:text-[var(--brass)]"
                style={{ borderColor: "var(--panel-border)", color: "var(--text-muted)" }}
              >
                Sign out
              </button>
            </>
          )}
          {!isLoading && !token && (
            <>
              <Link href="/login" className="transition hover:text-[var(--brass)]">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-sm border px-3 py-1.5 transition"
                style={{
                  borderColor: "var(--brass)",
                  color: "var(--brass)",
                }}
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
