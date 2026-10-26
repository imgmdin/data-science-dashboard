import { sql } from "./db";

export async function setAttended(eventId: string, id: string, attended: boolean): Promise<boolean> {
  const rows = await sql()`
    UPDATE registrations SET attended_at = ${attended ? new Date().toISOString() : null}
    WHERE id = ${id}::uuid AND event_id = ${eventId}::uuid RETURNING id`;
  return rows.length > 0;
}

/** A person who turned up without registering on the portal. Marked as attended straight away. */
export async function addWalkIn(
  eventId: string,
  p: { name: string; email: string; department: string },
): Promise<"ok" | "duplicate"> {
  const rows = await sql()`
    INSERT INTO registrations (event_id, name, email, department, attended_at, source)
    VALUES (${eventId}::uuid, ${p.name}, ${p.email}, ${p.department}, now(), 'walk-in')
    ON CONFLICT (event_id, lower(email)) DO NOTHING RETURNING id`;
  return rows.length ? "ok" : "duplicate";
}
