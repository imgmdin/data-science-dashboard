import { listMeetings, startMeeting } from "@/lib/meetings";

export async function GET() {
  try {
    return Response.json(await listMeetings());
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as { title?: unknown; quorum?: unknown } | null;
  const title = typeof b?.title === "string" ? b.title.trim().slice(0, 160) : "";
  const quorum = Math.floor(Number(b?.quorum));
  if (!title) return Response.json({ error: "Give the meeting a title." }, { status: 400 });
  if (!Number.isFinite(quorum) || quorum < 1 || quorum > 500) return Response.json({ error: "Quorum must be at least 1." }, { status: 400 });
  try {
    return Response.json({ id: await startMeeting(title, quorum) }, { status: 201 });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
