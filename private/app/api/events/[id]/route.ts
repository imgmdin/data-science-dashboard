import { deleteEvent, parseEventInput, updateEvent } from "@/lib/events";

type Ctx = { params: Promise<{ id: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const notFound = () => Response.json({ error: "Not found" }, { status: 404 });

export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return notFound();
  const input = parseEventInput(await req.json().catch(() => null));
  if (typeof input === "string") return Response.json({ error: input }, { status: 400 });
  const row = await updateEvent(id, input);
  return row ? Response.json(row) : notFound();
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return notFound();
  return (await deleteEvent(id)) ? Response.json({ ok: true }) : notFound();
}
