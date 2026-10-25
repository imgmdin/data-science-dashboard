"use client";

import { useEffect, useState } from "react";

export function CheckInForm({ slug }: { slug: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [result, setResult] = useState<{ name: string; already: boolean } | null>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    setState("sending");
    setError("");
    try {
      const res = await fetch(`/api/events/${slug}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Something went wrong. Please try again.");
      setResult({ name: body.name, already: body.already });
      setState("done");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  }

  if (state === "done" && result) {
    return (
      <div role="status" className="rounded-lg bg-emerald-50 p-5 text-emerald-950">
        <p className="text-lg font-semibold">{result.already ? "You were already checked in" : "You’re checked in"}</p>
        <p className="mt-1 text-sm">Welcome, {result.name}. Enjoy the event.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm font-medium text-slate-800">
        Email you registered with
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
      <button disabled={state === "sending" || !ready} className="w-full rounded-lg bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60">
        {state === "sending" ? "Checking in…" : "Check in"}
      </button>
    </form>
  );
}
