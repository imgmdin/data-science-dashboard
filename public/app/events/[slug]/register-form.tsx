"use client";

import { useEffect, useState } from "react";

const inputCls =
  "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

export function RegisterForm({ slug, eventTitle }: { slug: string; eventTitle: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  // Disabled until hydrated so an early click cannot submit the form natively.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    setError("");
    try {
      const res = await fetch(`/api/events/${slug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(f)),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Something went wrong. Please try again.");
      setState("done");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div role="status" className="rounded-lg bg-emerald-50 p-4 text-emerald-950">
        <p className="font-semibold">You’re registered</p>
        <p className="mt-1 text-sm">Your place at {eventTitle} is reserved. Add it to your calendar so you don’t miss it.</p>
        <a href={`/events/${slug}/calendar.ics`} className="mt-3 inline-block text-sm font-semibold text-emerald-900 underline underline-offset-2">
          Add to calendar
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm font-medium text-slate-800">
        Full name
        <input name="name" required maxLength={120} autoComplete="name" className={inputCls} />
      </label>
      <label className="block text-sm font-medium text-slate-800">
        Email
        <input name="email" type="email" required maxLength={200} autoComplete="email" className={inputCls} />
      </label>
      <label className="block text-sm font-medium text-slate-800">
        Department and year <span className="font-normal text-slate-600">(optional)</span>
        <input name="department" maxLength={120} placeholder="e.g. Computer Science, 3rd year" className={inputCls} />
      </label>
      {/* Honeypot: hidden from people, tempting to bots. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      {error ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
      <button
        disabled={state === "sending" || !ready}
        className="w-full rounded-lg bg-brand-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
      >
        {state === "sending" ? "Registering…" : "Register"}
      </button>
    </form>
  );
}
