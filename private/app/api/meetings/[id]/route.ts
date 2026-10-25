import { closeMeeting, deleteMeeting, getMeeting } from "@/lib/meetings";

type Ctx = { params: Promise<{ id: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const notFound = () => Response.json({ error: "Not found" }, { status: 404 });

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return notFound();
  const m = await getMeeting(id);
  return m ? Response.json(m) : notFound();
}

/** PATCH closes the meeting, which locks the attendance record. */
export async function PATCH(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return notFound();
  return (await closeMeeting(id)) ? Response.json({ ok: true }) : notFound();
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return notFound();
  return (await deleteMeeting(id)) ? Response.json({ ok: true }) : notFound();
}
