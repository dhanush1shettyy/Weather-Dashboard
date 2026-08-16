"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export default function LandingPage() {
  const { token, isLoading } = useAuth();
  const primaryHref = !isLoading && token ? "/dashboard" : "/signup";

  return (
    <div className="space-y-28 pb-20">
      {/* hero */}
      <section className="animate-fade-up flex flex-col items-center pt-16 text-center sm:pt-24">
        <span
          className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono-ui text-[11px] uppercase tracking-[0.2em]"
          style={{ borderColor: "var(--panel-border)", color: "var(--text-muted)", background: "var(--panel)" }}
        >
          <span style={{ color: "var(--brass)" }}>⟡</span> Live weather, everywhere
        </span>

        <h1 className="font-display max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
          Read the sky
          <br />
          <span style={{ color: "var(--brass)" }}>like an instrument.</span>
        </h1>

        <p
          className="mt-7 max-w-xl text-lg leading-relaxed sm:text-xl"
          style={{ color: "var(--text-muted)" }}
        >
          Search any station on Earth, track it against your favorites, and keep a running log
          of every reading you've taken.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href={primaryHref} className="btn btn-primary px-8 py-3.5 text-base">
            Get started
          </Link>
          <Link href="/dashboard" className="btn btn-outline px-8 py-3.5 text-base">
            Try it without an account
          </Link>
        </div>
      </section>

      {/* feature strip */}
      <section className="stagger-children grid gap-px overflow-hidden rounded-sm border sm:grid-cols-3" style={{ borderColor: "var(--panel-border)" }}>
        <Feature
          icon="⌖"
          title="Search any station"
          body="Type a city or drop a pin on your location — current conditions and a 7-day outlook, instantly."
        />
        <Feature
          icon="⟡"
          title="Save your favorites"
          body="Pin the stations you check often so they're one tap away, every time you sign in."
        />
        <Feature
          icon="⏱"
          title="Full search history"
          body="Every reading you take is logged, so you can look back at what the sky was doing and when."
        />
      </section>

      {/* secondary CTA */}
      <section
        className="animate-fade-up flex flex-col items-center gap-5 rounded-sm border px-8 py-16 text-center"
        style={{ borderColor: "var(--panel-border)", background: "var(--panel)" }}
      >
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Your own weather station, from any browser.
        </h2>
        <p className="max-w-md text-base" style={{ color: "var(--text-muted)" }}>
          Free to use, no card required. Create an account to unlock favorites and history.
        </p>
        <Link href={primaryHref} className="btn btn-primary mt-2 px-8 py-3.5 text-base">
          Get started
        </Link>
      </section>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div
      className="animate-fade-up flex flex-col gap-3 px-7 py-9 transition-colors hover:bg-[var(--bg-deep)]"
      style={{ background: "var(--bg-deep)" }}
    >
      <span className="font-mono-ui text-2xl" style={{ color: "var(--brass)" }}>
        {icon}
      </span>
      <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {body}
      </p>
    </div>
  );
}
