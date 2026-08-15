"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <p className="font-mono-ui text-[10px] uppercase tracking-[0.25em]" style={{ color: "var(--text-faint)" }}>
        Access
      </p>
      <h1 className="font-display mt-1 mb-8 text-2xl font-semibold tracking-tight">Sign in</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </Field>
        {error && (
          <p className="font-mono-ui text-xs" style={{ color: "var(--danger)" }}>
            ! {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-sm border py-3 font-mono-ui text-xs uppercase tracking-wider transition disabled:opacity-40"
          style={{ borderColor: "var(--brass)", color: "var(--brass)" }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-5 font-mono-ui text-xs" style={{ color: "var(--text-muted)" }}>
        No account?{" "}
        <Link href="/signup" className="underline" style={{ color: "var(--ice)" }}>
          Register
        </Link>
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono-ui text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--text-faint)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}
