import { getSettings, saveSettings } from "@/lib/certificates";

export async function GET() {
  try {
    return Response.json(await getSettings());
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const b = (await req.json().catch(() => null)) as { heading?: unknown; intro?: unknown } | null;
  if (!b || typeof b.heading !== "string" || typeof b.intro !== "string" || !b.heading.trim())
    return Response.json({ error: "Heading is required." }, { status: 400 });
  await saveSettings({ heading: b.heading.trim(), intro: b.intro.trim() });
  return Response.json({ ok: true });
}
