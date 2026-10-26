import { guard } from "@/lib/http";
import { deleteMember, parseMember, updateMember } from "@/lib/members";

type Ctx = { params: Promise<{ id: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const notFound = () => Response.json({ error: "Not found" }, { status: 404 });

export const PUT = (req: Request, ctx: Ctx) =>
  guard(async () => {
    const { id } = await ctx.params;
    if (!UUID.test(id)) return notFound();
    const input = parseMember(await req.json().catch(() => null));
    if (typeof input === "string") return Response.json({ error: input }, { status: 400 });
    const row = await updateMember(id, input);
    return row ? Response.json(row) : notFound();
  });

export const DELETE = (_req: Request, ctx: Ctx) =>
  guard(async () => {
    const { id } = await ctx.params;
    if (!UUID.test(id)) return notFound();
    return (await deleteMember(id)) ? Response.json({ ok: true }) : notFound();
  });
