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
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-8">
      <div
        className="animate-fade-up rounded-sm border p-8 sm:p-10"
        style={{ borderColor: "var(--panel-border)", background: "var(--panel)" }}
      >
        <p className="font-mono-ui text-[11px] uppercase tracking-[0.3em]" style={{ color: "var(--brass)" }}>
          Access
        </p>
        <h1 className="font-display mt-2 mb-9 text-4xl font-semibold tracking-tight">Sign in</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
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
          <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-40">
            {loading ? (
              <span className="loading-dots inline-flex items-center gap-0.5">
                Signing in<span>.</span><span>.</span><span>.</span>
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
        <p className="mt-6 font-mono-ui text-xs" style={{ color: "var(--text-muted)" }}>
          No account?{" "}
          <Link href="/signup" className="underline" style={{ color: "var(--ice)" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span
        className="mb-2 block font-mono-ui text-[11px] uppercase tracking-[0.2em]"
        style={{ color: "var(--text-faint)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
