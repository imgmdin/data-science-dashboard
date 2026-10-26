import { getSettings, saveSettings } from "@/lib/certificates";
import { guard } from "@/lib/http";

export const GET = () => guard(async () => Response.json(await getSettings()));

export const PUT = (req: Request) =>
  guard(async () => {
    const b = (await req.json().catch(() => null)) as { heading?: unknown; intro?: unknown } | null;
    if (!b || typeof b.heading !== "string" || typeof b.intro !== "string" || !b.heading.trim())
      return Response.json({ error: "Heading is required." }, { status: 400 });
    await saveSettings({ heading: b.heading.trim(), intro: b.intro.trim() });
    return Response.json({ ok: true });
  });
