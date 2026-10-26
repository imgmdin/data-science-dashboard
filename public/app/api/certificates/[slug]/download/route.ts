import { countDownload } from "@/lib/certificates";

export async function POST(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return Response.json({ ok: false }, { status: 404 });
  try {
    return Response.json({ ok: await countDownload(slug) });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
