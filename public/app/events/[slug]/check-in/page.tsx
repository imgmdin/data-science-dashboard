import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { formatWhen } from "@/lib/event-status";
import { getEvent, type PublicEvent } from "@/lib/events";
import { CheckInForm } from "./check-in-form";

export const metadata = { title: "Event check-in — Society Portal" };

export default function CheckInPage({ params }: PageProps<"/events/[slug]/check-in">) {
  return (
    <Suspense fallback={<p className="px-5 py-16 text-center text-slate-600">Loading…</p>}>
      <Inner params={params} />
    </Suspense>
  );
}

async function Inner({ params }: { params: PageProps<"/events/[slug]/check-in">["params"] }) {
  await connection();
  const { slug } = await params;
  let e: PublicEvent | null = null;
  try {
    e = /^[a-z0-9-]{1,80}$/.test(slug) ? await getEvent(slug) : null;
  } catch {
    return <p className="px-5 py-24 text-center text-slate-600">Check-in is unavailable right now. Please try again.</p>;
  }
  if (!e) notFound();

  return (
    <main className="mx-auto max-w-md px-5 py-12">
      <p className="text-sm font-semibold text-brand-700">Event check-in</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-brand-950 text-balance">{e.title}</h1>
      <p className="mt-1 text-sm text-slate-600">{formatWhen(e.startAt, e.endAt)}</p>
      <div className="mt-6 rounded-xl border border-brand-100 bg-white p-5">
        <CheckInForm slug={e.slug} />
      </div>
      <p className="mt-4 text-sm text-slate-600">
        Not registered?{" "}
        <Link href={`/events/${e.slug}`} className="font-medium text-brand-700 hover:text-brand-900">
          View the event
        </Link>{" "}
        or ask a volunteer to add you.
      </p>
    </main>
  );
}
