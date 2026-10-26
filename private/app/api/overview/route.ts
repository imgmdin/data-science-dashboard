import { sql } from "@/lib/db";

/** Real figures for the dashboard Overview. */
export async function GET() {
  try {
    const q = sql();
    const [members, events, regs, certs, upcoming] = await Promise.all([
      q`SELECT count(*) FILTER (WHERE status = 'Active') AS active, count(*) FILTER (WHERE status = 'Pending') AS pending,
               count(*) FILTER (WHERE is_cabinet) AS cabinet, count(*) AS total FROM members`,
      q`SELECT count(*) FILTER (WHERE published AND start_at > now()) AS upcoming,
               count(*) FILTER (WHERE published AND start_at <= now() AND end_at >= now()) AS ongoing,
               count(*) FILTER (WHERE published AND end_at < now()) AS concluded,
               count(*) FILTER (WHERE NOT published) AS drafts FROM events`,
      q`SELECT count(*) AS registered, count(attended_at) AS attended FROM registrations`,
      q`SELECT count(*) FILTER (WHERE published) AS published, COALESCE(sum(download_count), 0) AS downloads FROM certificates`,
      q`SELECT e.slug, e.title, e.category, e.start_at, e.end_at, e.capacity,
               (SELECT count(*) FROM registrations r WHERE r.event_id = e.id) AS registered
        FROM events e WHERE e.published AND e.end_at >= now() ORDER BY e.start_at LIMIT 5`,
    ]);
    const n = (v: unknown) => Number(v ?? 0);
    return Response.json({
      members: { active: n(members[0].active), pending: n(members[0].pending), cabinet: n(members[0].cabinet), total: n(members[0].total) },
      events: { upcoming: n(events[0].upcoming), ongoing: n(events[0].ongoing), concluded: n(events[0].concluded), drafts: n(events[0].drafts) },
      registrations: { registered: n(regs[0].registered), attended: n(regs[0].attended) },
      certificates: { published: n(certs[0].published), downloads: n(certs[0].downloads) },
      upcoming: upcoming.map((r) => ({
        slug: r.slug as string,
        title: r.title as string,
        category: r.category as string,
        startAt: new Date(r.start_at as string).toISOString(),
        endAt: new Date(r.end_at as string).toISOString(),
        capacity: (r.capacity as number | null) ?? null,
        registered: n(r.registered),
      })),
    });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
