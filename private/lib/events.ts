import { sql } from "./db";

export { CATEGORIES, MODES } from "./event-types";
export type { EventRecord, EventInput, Registration } from "./event-types";
import type { EventRecord, EventInput, Registration } from "./event-types";
import { MODES } from "./event-types";

type Row = Record<string, unknown>;
const iso = (v: unknown) => new Date(v as string).toISOString();

function toRecord(r: Row): EventRecord {
  return {
    id: r.id as string,
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
    agenda: r.agenda as string,
    speakers: r.speakers as string,
    recap: r.recap as string,
    certificateId: (r.certificate_id as string | null) ?? null,
    published: r.published as boolean,
    registered: Number(r.registered ?? 0),
  };
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max).trim() : "");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseEventInput(body: unknown): EventInput | string {
  if (!body || typeof body !== "object") return "Invalid body";
  const b = body as Record<string, unknown>;
  const title = str(b.title, 160);
  if (!title) return "The event needs a title.";
  const startAt = typeof b.startAt === "string" ? new Date(b.startAt) : null;
  const endAt = typeof b.endAt === "string" ? new Date(b.endAt) : null;
  if (!startAt || !endAt || Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) return "Set a valid start and end time.";
  if (endAt <= startAt) return "The end time must be after the start time.";
  let deadline: string | null = null;
  if (typeof b.registrationDeadline === "string" && b.registrationDeadline) {
    const d = new Date(b.registrationDeadline);
    if (Number.isNaN(d.getTime())) return "Registration deadline is not a valid date.";
    deadline = d.toISOString();
  }
  let capacity: number | null = null;
  if (b.capacity !== null && b.capacity !== undefined && b.capacity !== "") {
    capacity = Math.floor(Number(b.capacity));
    if (!Number.isFinite(capacity) || capacity < 1 || capacity > 100000) return "Capacity must be a positive number, or left empty for no limit.";
  }
  const joinUrl = str(b.joinUrl, 400);
  if (joinUrl && !/^https?:\/\//i.test(joinUrl)) return "The join link must start with http:// or https://";
  const certificateId = typeof b.certificateId === "string" && UUID.test(b.certificateId) ? b.certificateId : null;
  return {
    title,
    category: str(b.category, 40) || "Event",
    summary: str(b.summary, 240),
    description: str(b.description, 5000),
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    registrationDeadline: deadline,
    venue: str(b.venue, 200),
    mode: (MODES as readonly string[]).includes(str(b.mode, 20)) ? str(b.mode, 20) : "in-person",
    joinUrl,
    capacity,
    agenda: str(b.agenda, 3000),
    speakers: str(b.speakers, 2000),
    recap: str(b.recap, 3000),
    certificateId,
    published: b.published === true,
  };
}

function slugify(s: string) {
  const base = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "event";
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

const WITH_COUNT = `(SELECT count(*) FROM registrations r WHERE r.event_id = e.id) AS registered`;

export async function listEvents(): Promise<EventRecord[]> {
  const rows = await sql().query(`SELECT e.*, ${WITH_COUNT} FROM events e ORDER BY e.start_at DESC`);
  return rows.map(toRecord);
}

export async function createEvent(i: EventInput): Promise<EventRecord> {
  const rows = await sql()`
    INSERT INTO events (slug, title, category, summary, description, start_at, end_at, registration_deadline, venue, mode,
      join_url, capacity, agenda, speakers, recap, certificate_id, published)
    VALUES (${slugify(i.title)}, ${i.title}, ${i.category}, ${i.summary}, ${i.description}, ${i.startAt}, ${i.endAt},
      ${i.registrationDeadline}, ${i.venue}, ${i.mode}, ${i.joinUrl}, ${i.capacity}, ${i.agenda}, ${i.speakers}, ${i.recap},
      ${i.certificateId}, ${i.published})
    RETURNING *, 0 AS registered`;
  return toRecord(rows[0]);
}

export async function updateEvent(id: string, i: EventInput): Promise<EventRecord | null> {
  const rows = await sql()`
    UPDATE events e SET title = ${i.title}, category = ${i.category}, summary = ${i.summary}, description = ${i.description},
      start_at = ${i.startAt}, end_at = ${i.endAt}, registration_deadline = ${i.registrationDeadline}, venue = ${i.venue},
      mode = ${i.mode}, join_url = ${i.joinUrl}, capacity = ${i.capacity}, agenda = ${i.agenda}, speakers = ${i.speakers},
      recap = ${i.recap}, certificate_id = ${i.certificateId}, published = ${i.published}, updated_at = now()
    WHERE e.id = ${id}::uuid
    RETURNING e.*, (SELECT count(*) FROM registrations r WHERE r.event_id = e.id) AS registered`;
  return rows[0] ? toRecord(rows[0]) : null;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const rows = await sql()`DELETE FROM events WHERE id = ${id}::uuid RETURNING id`;
  return rows.length > 0;
}

export async function listRegistrations(eventId: string): Promise<Registration[]> {
  const rows = await sql()`SELECT * FROM registrations WHERE event_id = ${eventId}::uuid ORDER BY created_at`;
  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    email: r.email as string,
    department: r.department as string,
    createdAt: iso(r.created_at),
    attendedAt: r.attended_at ? iso(r.attended_at) : null,
    source: r.source as string,
  }));
}

export async function deleteRegistration(eventId: string, id: string): Promise<boolean> {
  const rows = await sql()`DELETE FROM registrations WHERE id = ${id}::uuid AND event_id = ${eventId}::uuid RETURNING id`;
  return rows.length > 0;
}
