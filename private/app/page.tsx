"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { eventStatus, formatWhen, type Phase } from "@/lib/event-status";

type Overview = {
  members: { active: number; pending: number; cabinet: number; total: number };
  events: { upcoming: number; ongoing: number; concluded: number; drafts: number };
  registrations: { registered: number; attended: number };
  certificates: { published: number; downloads: number };
  upcoming: { slug: string; title: string; category: string; startAt: string; endAt: string; capacity: number | null; registered: number }[];
};

const actions = [
  { label: "Manage members", href: "/members" },
  { label: "Create an event", href: "/events" },
  { label: "Record attendance", href: "/attendance" },
  { label: "Publish a certificate", href: "/certificates" },
];

const PHASE_STYLE: Record<Phase, string> = {
  open: "bg-emerald-50 text-emerald-800",
  scheduled: "bg-amber-50 text-amber-900",
  ongoing: "bg-brand-100 text-brand-900",
  concluded: "bg-slate-100 text-slate-700",
};

export default function Home() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/overview")
      .then(async (r) => {
        const b = await r.json();
        if (!r.ok) throw new Error(b.error);
        setData(b);
      })
      .catch((e) => setError(e.message || "Could not load the overview."));
  }, []);

  const rate = data && data.registrations.registered ? Math.round((data.registrations.attended / data.registrations.registered) * 100) : null;
  const stats = [
    { label: "Active members", value: data?.members.active, note: data ? `${data.members.cabinet} on cabinet · ${data.members.pending} pending` : "" },
    { label: "Upcoming events", value: data?.events.upcoming, note: data ? `${data.events.ongoing} happening now · ${data.events.drafts} draft${data.events.drafts === 1 ? "" : "s"}` : "" },
    { label: "Registrations", value: data?.registrations.registered, note: data ? (rate === null ? "No registrations yet" : `${rate}% have checked in`) : "" },
    { label: "Certificates downloaded", value: data?.certificates.downloads, note: data ? `${data.certificates.published} published` : "" },
  ];

  return (
    <main className="mx-auto max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-brand-950">Overview</h1>
        <p className="mt-1 text-slate-600">Live figures from your members, events and certificates.</p>
      </header>

      {error ? (
        <p role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <section aria-label="Key figures" className="mb-8 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white lg:grid-cols-4 lg:divide-x lg:divide-slate-200">
        {stats.map((s, i) => (
          <div key={s.label} className={`p-5 ${i >= 2 ? "border-t border-slate-200 lg:border-t-0" : ""} ${i % 2 === 1 ? "border-l border-slate-200 lg:border-l-0" : ""}`}>
            <p className="text-sm text-slate-600">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-brand-950">{s.value ?? "—"}</p>
            <p className="mt-1 text-xs text-slate-600">{s.note || " "}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-6 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-brand-950">Upcoming and ongoing events</h2>
            <Link href="/events" className="text-sm font-medium text-brand-700 hover:text-brand-900">
              View all
            </Link>
          </div>
          {data === null ? (
            <p className="text-sm text-slate-600">Loading…</p>
          ) : data.upcoming.length === 0 ? (
            <p className="text-sm text-slate-600">
              No published events coming up.{" "}
              <Link href="/events" className="font-medium text-brand-700 hover:text-brand-900">
                Create one
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.upcoming.map((e) => {
                const s = eventStatus({ ...e, registrationDeadline: null });
                return (
                  <li key={e.slug} className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-medium">{e.title}</p>
                      <p className="text-sm text-slate-600">
                        {formatWhen(e.startAt, e.endAt)} · {e.registered}
                        {e.capacity ? ` / ${e.capacity}` : ""} registered
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${PHASE_STYLE[s.phase]}`}>{s.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-brand-950">Quick actions</h2>
          <ul className="space-y-2">
            {actions.map((a) => (
              <li key={a.href}>
                <Link href={a.href} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium transition-colors hover:border-brand-300 hover:bg-brand-50">
                  {a.label}
                  <span aria-hidden="true" className="text-brand-600">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
