import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { eventStatus, formatDate, formatTime } from "@/lib/event-status";
import { getSettings } from "@/lib/certificates";
import { listEvents, type PublicEvent } from "@/lib/events";
import { StatusBadge, placeOf } from "./components/event-ui";
import { EventBrowser, type Groups } from "./event-browser";

export default function Home() {
  return (
    <Suspense fallback={<p className="px-5 py-16 text-center text-slate-600">Loading…</p>}>
      <Portal />
    </Suspense>
  );
}

async function Portal() {
  await connection(); // always read fresh data from the database
  let settings, events: PublicEvent[];
  try {
    [settings, events] = await Promise.all([getSettings(), listEvents()]);
  } catch {
    return (
      <main className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="text-2xl font-semibold text-brand-950">The portal is unavailable right now</h1>
        <p className="mt-2 text-slate-600">Please try again in a few minutes.</p>
      </main>
    );
  }

  const withStatus = events.map((e) => ({ e, s: eventStatus(e) }));
  const pick = (phase: string) => withStatus.filter((x) => x.s.phase === phase).map((x) => x.e);
  const groups: Groups = {
    now: pick("ongoing"),
    open: pick("open"),
    later: pick("scheduled"),
    recent: pick("concluded").reverse().slice(0, 3),
  };
  // Lead with something the visitor can sign up for right now.
  const featured = groups.open[0] ?? groups.now[0] ?? groups.later[0] ?? null;

  return (
    <main>
      <section className="bg-[#220668] text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-14 pt-10 md:grid-cols-[1.2fr_1fr] md:pb-20 md:pt-16">
          <div>
            <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-balance md:text-5xl">{settings.heading}</h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-brand-200">{settings.intro}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#events" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-900 hover:bg-brand-100">
                See open events
              </a>
              <Link href="/certificates" className="rounded-lg px-5 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/40 hover:bg-white/10">
                Get a certificate
              </Link>
            </div>
          </div>

          {featured ? <Featured event={featured} /> : null}
        </div>
      </section>

      <div id="events" className="mx-auto max-w-6xl scroll-mt-6 px-5 py-12">
        <EventBrowser groups={groups} />
      </div>
    </main>
  );
}

function Featured({ event: e }: { event: PublicEvent }) {
  const s = eventStatus(e);
  const heading = s.phase === "open" ? "Open for registration" : s.phase === "ongoing" ? "Happening now" : "Next event";
  return (
    <aside aria-label={heading} className="rounded-2xl bg-white p-6 text-slate-900">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-brand-700">{heading}</p>
        {s.phase === "open" ? null : <StatusBadge event={e} />}
      </div>
      <h2 className="mt-3 text-2xl font-semibold leading-snug text-brand-950 text-balance">{e.title}</h2>
      <dl className="mt-4 space-y-1.5 text-sm text-slate-700">
        <div>{formatDate(e.startAt)}</div>
        <div>{formatTime(e.startAt)} · {placeOf(e)}</div>
        {s.phase === "open" && s.spotsLeft !== null ? <div className="font-medium text-emerald-800">{s.spotsLeft} spots left</div> : null}
      </dl>
      <Link href={`/events/${e.slug}`} className="mt-5 inline-block rounded-lg bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-800">
        {s.phase === "open" ? "Register now" : s.phase === "ongoing" ? "Join now" : "View details"}
      </Link>
    </aside>
  );
}
