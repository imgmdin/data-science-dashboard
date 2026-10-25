import { connection } from "next/server";
import { Suspense } from "react";
import { eventStatus, formatYear } from "@/lib/event-status";
import { listEvents, type PublicEvent } from "@/lib/events";
import { EventList } from "../components/event-ui";

export const metadata = { title: "Past events — Society Portal" };

export default function Past() {
  return (
    <Suspense fallback={<p className="px-5 py-16 text-center text-slate-600">Loading…</p>}>
      <Archive />
    </Suspense>
  );
}

async function Archive() {
  await connection();
  let events: PublicEvent[];
  try {
    events = await listEvents();
  } catch {
    return (
      <main className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="text-2xl font-semibold text-brand-950">Past events are unavailable right now</h1>
        <p className="mt-2 text-slate-600">Please try again in a few minutes.</p>
      </main>
    );
  }

  const past = events.filter((e) => eventStatus(e).phase === "concluded").reverse();
  const byYear = new Map<string, PublicEvent[]>();
  for (const e of past) byYear.set(formatYear(e.startAt), [...(byYear.get(formatYear(e.startAt)) ?? []), e]);

  return (
    <main>
      <section className="bg-[#220668] text-white">
        <div className="mx-auto max-w-6xl px-5 pb-10 pt-8 md:pb-14 md:pt-12">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Past events</h1>
          <p className="mt-3 max-w-xl text-lg text-brand-200">Recaps, materials and certificates from events the society has held.</p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-5 py-12">
        {past.length === 0 ? (
          <p className="rounded-xl border border-dashed border-brand-300 bg-white px-6 py-12 text-center text-slate-600">
            No events have concluded yet. Once they do, they will be archived here.
          </p>
        ) : (
          [...byYear].map(([year, list]) => <EventList key={year} title={year} events={list} note={`${list.length} event${list.length === 1 ? "" : "s"}`} />)
        )}
      </div>
    </main>
  );
}
