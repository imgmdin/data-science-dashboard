import { sql } from "./db";
import { eventStatus } from "./event-status";

export type PublicEvent = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  startAt: string;
  endAt: string;
  registrationDeadline: string | null;
  venue: string;
  mode: string;
  /** Only populated while the event is on, so the link is not exposed early. */
  joinUrl: string;
  capacity: number | null;
  registered: number;
  agenda: string;
  speakers: string;
  recap: string;
  certificateSlug: string | null;
};

type Row = Record<string, unknown>;
const iso = (v: unknown) => new Date(v as string).toISOString();

function toEvent(r: Row): PublicEvent {
  const e: PublicEvent = {
    slug: r.slug as string,
    title: r.title as string,
    category: r.category as string,
    summary: r.summary as string,
    description: r.description as string,
    startAt: iso(r.start_at),
    endAt: iso(r.end_at),
    registrationDeadline: r.registration_deadline ? iso(r.registration_deadline) : null,
    venue: r.venue as string,
    mode: r.mode as string,
    joinUrl: r.join_url as string,
    capacity: (r.capacity as number | null) ?? null,
    registered: Number(r.registered ?? 0),
    agenda: r.agenda as string,
    speakers: r.speakers as string,
    recap: r.recap as string,
    certificateSlug: (r.certificate_slug as string | null) ?? null,
  };
  if (eventStatus(e).phase !== "ongoing") e.joinUrl = "";
  return e;
}

const SELECT = `
  SELECT e.*,
    (SELECT count(*) FROM registrations r WHERE r.event_id = e.id) AS registered,
    (SELECT c.slug FROM certificates c WHERE c.id = e.certificate_id AND c.published) AS certificate_slug
  FROM events e WHERE e.published`;

export async function listEvents(): Promise<PublicEvent[]> {
  const rows = await sql().query(`${SELECT} ORDER BY e.start_at`);
  return rows.map(toEvent);
}

export async function getEvent(slug: string): Promise<PublicEvent | null> {
  const rows = await sql().query(`${SELECT} AND e.slug = $1`, [slug]);
  return rows[0] ? toEvent(rows[0]) : null;
}

export type RegisterResult =
  | { ok: true }
  | { ok: false; reason: "duplicate" | "full" | "closed" | "missing" };

export async function register(slug: string, p: { name: string; email: string; department: string }): Promise<RegisterResult> {
  const q = sql();
  // One statement checks the deadline and capacity and inserts, so a full event cannot be overbooked by a race.
  const inserted = await q`
    INSERT INTO registrations (event_id, name, email, department)
    SELECT e.id, ${p.name}, ${p.email}, ${p.department} FROM events e
    WHERE e.slug = ${slug} AND e.published
      AND now() < COALESCE(e.registration_deadline, e.start_at)
      AND (e.capacity IS NULL OR (SELECT count(*) FROM registrations r WHERE r.event_id = e.id) < e.capacity)
    ON CONFLICT (event_id, lower(email)) DO NOTHING
    RETURNING id`;
  if (inserted.length) return { ok: true };

  const ev = await getEvent(slug);
  if (!ev) return { ok: false, reason: "missing" };
  const dup = await q`
    SELECT 1 FROM registrations r JOIN events e ON e.id = r.event_id
    WHERE e.slug = ${slug} AND lower(r.email) = lower(${p.email})`;
  if (dup.length) return { ok: false, reason: "duplicate" };
  return { ok: false, reason: eventStatus(ev).full ? "full" : "closed" };
}

/** Parse "10:00 | Welcome" style lines. Lines without a pipe have no left column. */
export function parseLines(text: string): { left: string; right: string }[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf("|");
      return i === -1 ? { left: "", right: l } : { left: l.slice(0, i).trim(), right: l.slice(i + 1).trim() };
    });
}

export type CheckInResult =
  | { ok: true; name: string; already: boolean }
  | { ok: false; reason: "missing" | "window" | "unregistered" };

/** Check-in opens an hour before the start and closes when the event ends. */
export async function checkIn(slug: string, email: string): Promise<CheckInResult> {
  const ev = await getEvent(slug);
  if (!ev) return { ok: false, reason: "missing" };
  const now = Date.now();
  if (now < new Date(ev.startAt).getTime() - 3600e3 || now > new Date(ev.endAt).getTime()) return { ok: false, reason: "window" };
  const rows = await sql()`
    UPDATE registrations r SET attended_at = COALESCE(r.attended_at, now())
    FROM events e
    WHERE e.id = r.event_id AND e.slug = ${slug} AND lower(r.email) = lower(${email})
    RETURNING r.name, (r.attended_at < now() - interval '2 seconds') AS already`;
  if (!rows.length) return { ok: false, reason: "unregistered" };
  return { ok: true, name: rows[0].name as string, already: Boolean(rows[0].already) };
}
