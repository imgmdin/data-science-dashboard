"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PublicEvent } from "@/lib/events";
import { EventList } from "./components/event-ui";

export type Groups = { now: PublicEvent[]; open: PublicEvent[]; later: PublicEvent[]; recent: PublicEvent[] };

export function EventBrowser({ groups }: { groups: Groups }) {
  const [cat, setCat] = useState("All");

  const categories = useMemo(() => {
    const all = [...groups.now, ...groups.open, ...groups.later, ...groups.recent];
    return ["All", ...Array.from(new Set(all.map((e) => e.category)))];
  }, [groups]);

  const pick = (list: PublicEvent[]) => (cat === "All" ? list : list.filter((e) => e.category === cat));
  const g = { now: pick(groups.now), open: pick(groups.open), later: pick(groups.later), recent: pick(groups.recent) };
  const upcomingCount = g.now.length + g.open.length + g.later.length;

  return (
    <div>
      {categories.length > 2 ? (
        <div role="group" aria-label="Filter by event type" className="mb-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                cat === c ? "bg-brand-900 text-white" : "bg-white text-slate-700 ring-1 ring-brand-200 hover:ring-brand-400"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}

      <EventList title="Open for registration" events={g.open} note="Register to reserve your place" />
      <EventList title="Happening now" events={g.now} />
      <EventList title="Coming up" events={g.later} note="Registration is not open yet or has closed" />

      {upcomingCount === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-brand-950">No upcoming events{cat === "All" ? "" : ` in ${cat}`}</h2>
          <p className="mx-auto mt-1 max-w-md text-slate-600">New events are announced here first. In the meantime, see what the society has been up to.</p>
        </div>
      ) : null}

      <EventList title="Recently concluded" events={g.recent} />
      <p className="mt-6">
        <Link href="/past" className="text-sm font-semibold text-brand-700 hover:text-brand-900">
          Browse all past events →
        </Link>
      </p>
    </div>
  );
}
