import { deleteCertificate, getCertificate, parseInput, updateCertificate } from "@/lib/certificates";

type Ctx = { params: Promise<{ id: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function withId(ctx: Ctx) {
  const { id } = await ctx.params;
  return UUID.test(id) ? id : null;
}
const notFound = () => Response.json({ error: "Not found" }, { status: 404 });

export async function GET(_req: Request, ctx: Ctx) {
  const id = await withId(ctx);
  if (!id) return notFound();
  const row = await getCertificate(id);
  return row ? Response.json(row) : notFound();
}

export async function PUT(req: Request, ctx: Ctx) {
  const id = await withId(ctx);
  if (!id) return notFound();
  const input = parseInput(await req.json().catch(() => null));
  if (typeof input === "string") return Response.json({ error: input }, { status: 400 });
  const row = await updateCertificate(id, input);
  return row ? Response.json(row) : notFound();
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const id = await withId(ctx);
  if (!id) return notFound();
  return (await deleteCertificate(id)) ? Response.json({ ok: true }) : notFound();
}
