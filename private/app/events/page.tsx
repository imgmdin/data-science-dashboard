"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { eventStatus, formatWhen, type Phase } from "@/lib/event-status";
import type { EventRecord } from "@/lib/event-types";
import { EventEditor } from "./editor";

const PUBLIC_URL = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ?? "http://localhost:3001";

const PHASE_STYLE: Record<Phase, string> = {
  open: "bg-emerald-50 text-emerald-800",
  scheduled: "bg-amber-50 text-amber-900",
  ongoing: "bg-brand-100 text-brand-900",
  concluded: "bg-slate-100 text-slate-700",
};

type Filter = "all" | "upcoming" | "ongoing" | "concluded";

export default function EventsPage() {
  const [rows, setRows] = useState<EventRecord[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<EventRecord | "new" | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setRows(body);
      setError("");
    } catch (e) {
      setError((e as Error).message || "Could not load events.");
      setRows([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const items = useMemo(
    () =>
      (rows ?? []).map((e) => ({ e, s: eventStatus(e) })).filter(({ e, s }) => {
        const matchesFilter =
          filter === "all" ||
          (filter === "upcoming" && (s.phase === "open" || s.phase === "scheduled")) ||
          s.phase === filter;
        return matchesFilter && e.title.toLowerCase().includes(search.toLowerCase());
      }),
    [rows, filter, search],
  );

  if (editing) {
    return (
      <main className="mx-auto max-w-6xl">
        <EventEditor
          initial={editing === "new" ? null : editing}
          onClose={(changed) => {
            setEditing(null);
            if (changed) load();
          }}
        />
      </main>
    );
  }

  const stats = (rows ?? []).reduce(
    (a, e) => {
      const p = eventStatus(e).phase;
      if (p === "open" || p === "scheduled") a.upcoming++;
      if (p === "ongoing") a.ongoing++;
      if (p === "concluded") a.done++;
      a.regs += e.registered;
      return a;
    },
    { upcoming: 0, ongoing: 0, done: 0, regs: 0 },
  );

  return (
    <main className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-brand-950">Events</h1>
          <p className="mt-1 text-slate-600">Publish events to the Society Portal and see who has registered.</p>
        </div>
        <div className="flex items-center gap-3">
          <a href={PUBLIC_URL} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:border-brand-300">
            View portal
          </a>
          <button onClick={() => setEditing("new")} className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
            New event
          </button>
        </div>
      </header>

      {error ? (
        <p role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <section aria-label="Summary" className="mb-6 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white lg:grid-cols-4 lg:divide-x lg:divide-slate-200">
        {[
          ["Upcoming", stats.upcoming],
          ["Happening now", stats.ongoing],
          ["Concluded", stats.done],
          ["Total registrations", stats.regs],
        ].map(([label, value], i) => (
          <div key={label} className={`p-5 ${i >= 2 ? "border-t border-slate-200 lg:border-t-0" : ""} ${i % 2 === 1 ? "border-l border-slate-200 lg:border-l-0" : ""}`}>
            <p className="text-sm text-slate-600">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-brand-950">{value}</p>
          </div>
        ))}
      </section>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          aria-label="Search events"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events"
          className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <div role="group" aria-label="Filter by status" className="flex gap-1.5">
          {(["all", "upcoming", "ongoing", "concluded"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-colors ${filter === f ? "bg-brand-700 text-white" : "bg-white text-slate-700 ring-1 ring-slate-300 hover:ring-brand-300"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {rows === null ? (
        <p className="text-slate-600">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-300 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-brand-950">{rows.length === 0 ? "No events yet" : "No events match"}</h2>
          <p className="mx-auto mt-1 max-w-md text-slate-600">
            {rows.length === 0 ? "Create your first event, then publish it so members can register." : "Try a different filter or search."}
          </p>
          {rows.length === 0 ? (
            <button onClick={() => setEditing("new")} className="mt-5 rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
              Create an event
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {items.map(({ e, s }) => (
            <li key={e.id}>
              <button onClick={() => setEditing(e)} className="flex w-full flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4 text-left transition-colors hover:bg-brand-50">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-brand-950">{e.title}</span>
                    {!e.published ? <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">Draft</span> : null}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {e.category} · {formatWhen(e.startAt, e.endAt)}
                    {e.venue ? ` · ${e.venue}` : ""}
                  </p>
                </div>
                <span className="text-sm tabular-nums text-slate-700">
                  {e.registered}
                  {e.capacity ? ` / ${e.capacity}` : ""} registered
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PHASE_STYLE[s.phase]}`}>{s.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
