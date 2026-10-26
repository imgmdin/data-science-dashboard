import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { eventStatus, formatDate, formatTime } from "@/lib/event-status";
import { getEvent, parseLines, type PublicEvent } from "@/lib/events";
import { StatusBadge, placeOf } from "../../components/event-ui";
import { RegisterForm } from "./register-form";

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const e = /^[a-z0-9-]{1,80}$/.test(slug) ? await getEvent(slug).catch(() => null) : null;
  return { title: e ? `${e.title} — Society Portal` : "Event — Society Portal", description: e?.summary || undefined };
}

export default function EventPage({ params }: PageProps<"/events/[slug]">) {
  return (
    <Suspense fallback={<p className="px-5 py-16 text-center text-slate-600">Loading…</p>}>
      <Detail params={params} />
    </Suspense>
  );
}

async function Detail({ params }: { params: PageProps<"/events/[slug]">["params"] }) {
  await connection();
  const { slug } = await params;
  let e: PublicEvent | null = null;
  try {
    e = /^[a-z0-9-]{1,80}$/.test(slug) ? await getEvent(slug) : null;
  } catch {
    return (
      <main className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="text-2xl font-semibold text-brand-950">This event is unavailable right now</h1>
        <p className="mt-2 text-slate-600">Please try again in a few minutes.</p>
      </main>
    );
  }
  if (!e) notFound();

  const s = eventStatus(e);
  const agenda = parseLines(e.agenda);
  const speakers = parseLines(e.speakers);
  const paragraphs = e.description.split(/\n\s*\n/).filter(Boolean);
  const sameDay = formatDate(e.startAt) === formatDate(e.endAt);

  return (
    <main>
      <section className="bg-[#220668] text-white">
        <div className="mx-auto max-w-6xl px-5 pb-10 pt-6 md:pb-14">
          <Link href={s.phase === "concluded" ? "/past" : "/"} className="text-sm font-medium text-brand-200 hover:text-white">
            ← {s.phase === "concluded" ? "Past events" : "All events"}
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <StatusBadge event={e} />
            <span className="text-sm font-medium text-brand-200">{e.category}</span>
          </div>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-balance md:text-5xl">{e.title}</h1>
          {e.summary ? <p className="mt-3 max-w-2xl text-lg text-brand-200">{e.summary}</p> : null}
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-10">
          {s.phase === "concluded" && e.recap ? (
            <section>
              <h2 className="text-xl font-semibold text-brand-950">Recap</h2>
              <p className="mt-3 max-w-prose whitespace-pre-line leading-relaxed text-slate-800">{e.recap}</p>
            </section>
          ) : null}

          {paragraphs.length ? (
            <section>
              <h2 className="text-xl font-semibold text-brand-950">About this event</h2>
              <div className="mt-3 max-w-prose space-y-4 leading-relaxed text-slate-800">
                {paragraphs.map((p, i) => (
                  <p key={i} className="whitespace-pre-line">{p}</p>
                ))}
              </div>
            </section>
          ) : null}

          {agenda.length ? (
            <section>
              <h2 className="text-xl font-semibold text-brand-950">Agenda</h2>
              <ol className="mt-3 divide-y divide-brand-100 rounded-xl border border-brand-100 bg-white">
                {agenda.map((a, i) => (
                  <li key={i} className="flex gap-5 px-5 py-3.5">
                    {a.left ? <span className="w-20 shrink-0 text-sm font-semibold tabular-nums text-brand-700">{a.left}</span> : null}
                    <span className="text-slate-800">{a.right}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {speakers.length ? (
            <section>
              <h2 className="text-xl font-semibold text-brand-950">Speakers</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {speakers.map((p, i) => (
                  <li key={i} className="rounded-xl border border-brand-100 bg-white px-5 py-4">
                    <p className="font-semibold text-brand-950">{p.left || p.right}</p>
                    {p.left ? <p className="text-sm text-slate-600">{p.right}</p> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-brand-100 bg-white p-5">
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-medium text-slate-600">When</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">
                  {formatDate(e.startAt)}
                  {sameDay ? null : ` – ${formatDate(e.endAt)}`}
                </dd>
                <dd className="text-slate-700">
                  {formatTime(e.startAt)} – {formatTime(e.endAt)} PKT
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-600">Where</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">{placeOf(e)}</dd>
              </div>
              {e.capacity ? (
                <div>
                  <dt className="font-medium text-slate-600">Places</dt>
                  <dd className="mt-0.5 text-slate-900">
                    {s.phase === "concluded" ? `${e.registered} registered` : s.full ? "Fully booked" : `${s.spotsLeft} of ${e.capacity} left`}
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-5 border-t border-brand-100 pt-5">
              {s.phase === "open" ? (
                <>
                  <h2 className="mb-4 text-lg font-semibold text-brand-950">Register</h2>
                  <RegisterForm slug={e.slug} eventTitle={e.title} />
                </>
              ) : s.phase === "ongoing" ? (
                e.joinUrl ? (
                  <a href={e.joinUrl} target="_blank" rel="noreferrer" className="block rounded-lg bg-brand-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-800">
                    Join now
                  </a>
                ) : (
                  <p className="text-sm text-slate-800">This event is happening now at {placeOf(e)}.</p>
                )
              ) : s.phase === "scheduled" ? (
                <p className="text-sm text-slate-800">
                  {s.full ? "This event is fully booked." : "Registration for this event has closed."}
                </p>
              ) : e.certificateSlug ? (
                <>
                  <p className="mb-3 text-sm text-slate-800">This event has concluded. If you attended, you can download your certificate.</p>
                  <Link href={`/c/${e.certificateSlug}`} className="block rounded-lg bg-brand-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-800">
                    Get your certificate
                  </Link>
                </>
              ) : (
                <p className="text-sm text-slate-800">This event has concluded.</p>
              )}
            </div>

            {s.phase !== "concluded" ? (
              <a href={`/events/${e.slug}/calendar.ics`} className="mt-4 block text-center text-sm font-semibold text-brand-700 hover:text-brand-900">
                Add to calendar
              </a>
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
}
