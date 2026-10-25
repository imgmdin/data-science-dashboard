import { register } from "@/lib/events";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MESSAGES = {
  duplicate: "This email is already registered for the event.",
  full: "Sorry, this event is fully booked.",
  closed: "Registration for this event has closed.",
  missing: "Event not found.",
} as const;

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b || !/^[a-z0-9-]{1,80}$/.test(slug)) return Response.json({ error: "Invalid request." }, { status: 400 });
  // Hidden "website" field: real visitors leave it empty, simple bots fill it. Pretend success.
  if (typeof b.website === "string" && b.website) return Response.json({ ok: true });

  const name = typeof b.name === "string" ? b.name.trim().slice(0, 120) : "";
  const email = typeof b.email === "string" ? b.email.trim().slice(0, 200) : "";
  const department = typeof b.department === "string" ? b.department.trim().slice(0, 120) : "";
  if (!name) return Response.json({ error: "Enter your name." }, { status: 400 });
  if (!EMAIL.test(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });

  try {
    const r = await register(slug, { name, email, department });
    if (r.ok) return Response.json({ ok: true });
    return Response.json({ error: MESSAGES[r.reason], reason: r.reason }, { status: r.reason === "missing" ? 404 : 409 });
  } catch {
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
