import Link from "next/link";
import { eventStatus, formatDay, formatMonth, formatTime, formatWhen, type Phase } from "@/lib/event-status";
import type { PublicEvent } from "@/lib/events";

const BADGE: Record<Phase, string> = {
  open: "bg-emerald-50 text-emerald-900 ring-emerald-200",
  scheduled: "bg-amber-50 text-amber-900 ring-amber-200",
  ongoing: "bg-brand-900 text-white ring-brand-900",
  concluded: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function StatusBadge({ event }: { event: PublicEvent }) {
  const s = eventStatus(event);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${BADGE[s.phase]}`}>
      {s.phase === "ongoing" ? <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> : null}
      {s.label}
    </span>
  );
}

export function placeOf(e: PublicEvent) {
  if (e.mode === "online") return "Online";
  if (e.mode === "hybrid") return e.venue ? `${e.venue} + online` : "Hybrid";
  return e.venue || "Venue to be announced";
}

export function EventRow({ event: e }: { event: PublicEvent }) {
  const s = eventStatus(e);
  const dim = s.phase === "concluded";
  return (
    <Link
      href={`/events/${e.slug}`}
      className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-brand-50 sm:gap-6 sm:px-6"
    >
      <div className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg ${dim ? "bg-slate-100 text-slate-700" : "bg-brand-900 text-white"}`}>
        <span className="text-xs font-medium uppercase tracking-wide opacity-80">{formatMonth(e.startAt)}</span>
        <span className="text-2xl font-semibold leading-none tabular-nums">{formatDay(e.startAt)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="text-lg font-semibold text-brand-950 group-hover:text-brand-700">{e.title}</h3>
          <span className="text-xs font-medium text-slate-600">{e.category}</span>
        </div>
        {e.summary ? <p className="mt-0.5 line-clamp-1 text-sm text-slate-700">{e.summary}</p> : null}
        <p className="mt-1 text-sm text-slate-600">
          {formatTime(e.startAt)} · {placeOf(e)}
          {s.phase === "open" && s.spotsLeft !== null ? ` · ${s.spotsLeft} spot${s.spotsLeft === 1 ? "" : "s"} left` : ""}
        </p>
      </div>
      <div className="hidden shrink-0 sm:block">
        <StatusBadge event={e} />
      </div>
      <span aria-hidden="true" className="text-brand-600 transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}

export function EventList({ title, events, note }: { title: string; events: PublicEvent[]; note?: string }) {
  if (events.length === 0) return null;
  return (
    <section aria-labelledby={`h-${title}`} className="mt-10 first:mt-0">
      <div className="mb-3 flex items-baseline gap-3">
        <h2 id={`h-${title}`} className="text-xl font-semibold text-brand-950">
          {title}
        </h2>
        {note ? <span className="text-sm text-slate-600">{note}</span> : null}
      </div>
      <ul className="divide-y divide-brand-100 overflow-hidden rounded-xl border border-brand-100 bg-white">
        {events.map((e) => (
          <li key={e.slug}>
            <EventRow event={e} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export { formatWhen };
