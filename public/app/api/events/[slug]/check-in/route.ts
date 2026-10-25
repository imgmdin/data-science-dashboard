import { checkIn } from "@/lib/events";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MESSAGES = {
  missing: "Event not found.",
  window: "Check-in is not open right now. It opens one hour before the event starts and closes when it ends.",
  unregistered: "We could not find a registration with that email. Check the spelling, or ask a volunteer to add you.",
} as const;

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const b = (await req.json().catch(() => null)) as { email?: unknown } | null;
  const email = typeof b?.email === "string" ? b.email.trim().slice(0, 200) : "";
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return Response.json({ error: "Invalid request." }, { status: 400 });
  if (!EMAIL.test(email)) return Response.json({ error: "Enter the email you registered with." }, { status: 400 });
  try {
    const r = await checkIn(slug, email);
    if (r.ok) return Response.json({ ok: true, name: r.name, already: r.already });
    return Response.json({ error: MESSAGES[r.reason] }, { status: r.reason === "missing" ? 404 : 409 });
  } catch {
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
