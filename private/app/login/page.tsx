"use client";

import { useState } from "react";
import { BRAND } from "../brand";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Could not sign in.");
      // Only follow same-site paths, never an arbitrary address.
      const next = new URLSearchParams(window.location.search).get("next") ?? "/";
      window.location.assign(next.startsWith("/") && !next.startsWith("//") ? next : "/");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
      <h1 className="text-2xl font-semibold tracking-tight text-brand-950">{BRAND.portal}</h1>
      <p className="mt-1 text-sm text-slate-600">{BRAND.society} — cabinet members only.</p>
      <form onSubmit={submit} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <label className="block text-sm font-medium text-slate-800">
          Password
          <input
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </label>
        {error ? (
          <p role="alert" className="text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}
        <button disabled={busy} className="w-full rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
