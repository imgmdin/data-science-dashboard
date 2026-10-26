import { guard } from "@/lib/http";
import { listMeetings, startMeeting } from "@/lib/meetings";

export const GET = () => guard(async () => Response.json(await listMeetings()));

export const POST = (req: Request) =>
  guard(async () => {
    const b = (await req.json().catch(() => null)) as { title?: unknown; quorum?: unknown } | null;
    const title = typeof b?.title === "string" ? b.title.trim().slice(0, 160) : "";
    const quorum = Math.floor(Number(b?.quorum));
    if (!title) return Response.json({ error: "Give the meeting a title." }, { status: 400 });
    if (!Number.isFinite(quorum) || quorum < 1 || quorum > 500) return Response.json({ error: "Quorum must be at least 1." }, { status: 400 });
    return Response.json({ id: await startMeeting(title, quorum) }, { status: 201 });
  });
