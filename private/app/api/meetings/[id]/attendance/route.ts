import { guard } from "@/lib/http";
import { setAttendance } from "@/lib/meetings";
import { ATTENDANCE_STATUSES, type AttendanceStatus } from "@/lib/meeting-types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const PUT = (req: Request, ctx: { params: Promise<{ id: string }> }) =>
  guard(async () => {
    const { id } = await ctx.params;
    const b = (await req.json().catch(() => null)) as { memberId?: unknown; status?: unknown } | null;
    const memberId = typeof b?.memberId === "string" ? b.memberId : "";
    const status = b?.status as AttendanceStatus;
    if (!UUID.test(id) || !UUID.test(memberId) || !ATTENDANCE_STATUSES.includes(status)) {
      return Response.json({ error: "Invalid request." }, { status: 400 });
    }
    return (await setAttendance(id, memberId, status))
      ? Response.json({ ok: true })
      : Response.json({ error: "This meeting is closed or the member is not on its register." }, { status: 409 });
  });
