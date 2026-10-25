import { getEvent } from "@/lib/events";

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const e = /^[a-z0-9-]{1,80}$/.test(slug) ? await getEvent(slug) : null;
  if (!e) return new Response("Not found", { status: 404 });
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Data Science Society//Society Portal//EN",
    "BEGIN:VEVENT",
    `UID:${e.slug}@society-portal`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(e.startAt)}`,
    `DTEND:${stamp(e.endAt)}`,
    `SUMMARY:${esc(e.title)}`,
    ...(e.venue ? [`LOCATION:${esc(e.venue)}`] : []),
    ...(e.summary ? [`DESCRIPTION:${esc(e.summary)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="${e.slug}.ics"` },
  });
}
