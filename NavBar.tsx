"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function NavBar() {
  const { token, logout, isLoading } = useAuth();
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-10 border-b backdrop-blur"
      style={{ background: "rgba(8,17,28,0.85)", borderColor: "var(--panel-border)" }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <span
            className="logo-mark flex h-8 w-8 items-center justify-center rounded-full border font-mono-ui text-xs"
            style={{ borderColor: "var(--brass)", color: "var(--brass)" }}
          >
            ⟡
          </span>
          <span className="font-display text-base font-semibold tracking-tight">STATION</span>
          <span
            className="hidden font-mono-ui text-[11px] uppercase tracking-[0.2em] sm:inline"
            style={{ color: "var(--text-faint)" }}
          >
            / weather dashboard
          </span>
        </Link>

        <nav className="flex items-center gap-5 font-mono-ui text-[13px] uppercase tracking-wider">
          <Link
            href="/dashboard"
            className="nav-link transition-colors hover:text-[var(--brass)]"
            data-active={pathname === "/dashboard"}
          >
            Dashboard
          </Link>
          {!isLoading && token && (
            <>
              <Link
                href="/favorites"
                className="nav-link hidden transition-colors hover:text-[var(--brass)] sm:inline"
                data-active={pathname === "/favorites"}
              >
                Favorites
              </Link>
              <Link
                href="/history"
                className="nav-link hidden transition-colors hover:text-[var(--brass)] sm:inline"
                data-active={pathname === "/history"}
              >
                History
              </Link>
              <button onClick={logout} className="btn btn-ghost !px-3 !py-2 text-[11px]">
                Sign out
              </button>
            </>
          )}
          {!isLoading && !token && (
            <>
              <Link href="/login" className="nav-link transition-colors hover:text-[var(--brass)]" data-active={pathname === "/login"}>
                Sign in
              </Link>
              <Link href="/signup" className="btn btn-outline !px-3 !py-2 text-[11px]">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
