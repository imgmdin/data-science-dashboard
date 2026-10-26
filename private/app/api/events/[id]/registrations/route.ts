import { deleteRegistration, listRegistrations } from "@/lib/events";
import { addWalkIn, setAttended } from "@/lib/events-attendance";
import { guard } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Spreadsheet apps run text starting with = + - @ as formulas; prefix those cells.
const cell = (v: string) => {
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
};

export const GET = (req: Request, ctx: Ctx) =>
  guard(async () => {
    const { id } = await ctx.params;
    if (!UUID.test(id)) return Response.json({ error: "Not found" }, { status: 404 });
    const rows = await listRegistrations(id);
    if (new URL(req.url).searchParams.get("format") === "csv") {
      const csv = [
        "Name,Email,Department,Registered at,Attended,Checked in at,Source",
        ...rows.map((r) =>
          [r.name, r.email, r.department, r.createdAt, r.attendedAt ? "Yes" : "No", r.attendedAt ?? "", r.source].map(cell).join(","),
        ),
      ].join("\r\n");
      return new Response("﻿" + csv, {
        headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="event-attendance.csv"' },
      });
    }
    return Response.json(rows);
  });

/** Mark a registration as attended (or undo it). */
export const PATCH = (req: Request, ctx: Ctx) =>
  guard(async () => {
    const { id } = await ctx.params;
    const b = (await req.json().catch(() => null)) as { rid?: unknown; attended?: unknown } | null;
    const rid = typeof b?.rid === "string" ? b.rid : "";
    if (!UUID.test(id) || !UUID.test(rid) || typeof b?.attended !== "boolean") return Response.json({ error: "Invalid request." }, { status: 400 });
    return (await setAttended(id, rid, b.attended)) ? Response.json({ ok: true }) : Response.json({ error: "Not found" }, { status: 404 });
  });

/** Add someone who turned up without registering. */
export const POST = (req: Request, ctx: Ctx) =>
  guard(async () => {
    const { id } = await ctx.params;
    const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    const name = typeof b?.name === "string" ? b.name.trim().slice(0, 120) : "";
    const email = typeof b?.email === "string" ? b.email.trim().slice(0, 200) : "";
    const department = typeof b?.department === "string" ? b.department.trim().slice(0, 120) : "";
    if (!UUID.test(id) || !name) return Response.json({ error: "Enter the attendee's name." }, { status: 400 });
    if (!EMAIL.test(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    const r = await addWalkIn(id, { name, email, department });
    return Response.json({ ok: true, existing: r === "existing" }, { status: r === "ok" ? 201 : 200 });
  });

export const DELETE = (req: Request, ctx: Ctx) =>
  guard(async () => {
    const { id } = await ctx.params;
    const rid = new URL(req.url).searchParams.get("rid") ?? "";
    if (!UUID.test(id) || !UUID.test(rid)) return Response.json({ error: "Not found" }, { status: 404 });
    return (await deleteRegistration(id, rid)) ? Response.json({ ok: true }) : Response.json({ error: "Not found" }, { status: 404 });
  });
