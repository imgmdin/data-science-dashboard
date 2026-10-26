import { guard } from "@/lib/http";
import { closeMeeting, deleteMeeting, getMeeting } from "@/lib/meetings";

type Ctx = { params: Promise<{ id: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const notFound = () => Response.json({ error: "Not found" }, { status: 404 });

export const GET = (_req: Request, ctx: Ctx) =>
  guard(async () => {
    const { id } = await ctx.params;
    if (!UUID.test(id)) return notFound();
    const m = await getMeeting(id);
    return m ? Response.json(m) : notFound();
  });

/** PATCH closes the meeting, which locks the attendance record. */
export const PATCH = (_req: Request, ctx: Ctx) =>
  guard(async () => {
    const { id } = await ctx.params;
    if (!UUID.test(id)) return notFound();
    return (await closeMeeting(id)) ? Response.json({ ok: true }) : Response.json({ error: "This meeting is already closed." }, { status: 409 });
  });

export const DELETE = (_req: Request, ctx: Ctx) =>
  guard(async () => {
    const { id } = await ctx.params;
    if (!UUID.test(id)) return notFound();
    return (await deleteMeeting(id)) ? Response.json({ ok: true }) : notFound();
  });
