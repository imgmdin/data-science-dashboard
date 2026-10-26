import { sql } from "./db";
import type { Meeting, MeetingDetail, AttendanceStatus } from "./meeting-types";

type Row = Record<string, unknown>;
const iso = (v: unknown) => new Date(v as string).toISOString();

function toMeeting(r: Row): Meeting {
  return {
    id: r.id as string,
    title: r.title as string,
    quorum: r.quorum as number,
    status: r.status as Meeting["status"],
    heldAt: iso(r.held_at),
    closedAt: r.closed_at ? iso(r.closed_at) : null,
    present: Number(r.present ?? 0),
    excused: Number(r.excused ?? 0),
    total: Number(r.total ?? 0),
  };
}

const COUNTS = `
  (SELECT count(*) FILTER (WHERE a.status = 'Present') FROM meeting_attendance a WHERE a.meeting_id = m.id) AS present,
  (SELECT count(*) FILTER (WHERE a.status = 'Excused') FROM meeting_attendance a WHERE a.meeting_id = m.id) AS excused,
  (SELECT count(*) FROM meeting_attendance a WHERE a.meeting_id = m.id) AS total`;

export async function listMeetings(): Promise<Meeting[]> {
  const rows = await sql().query(`SELECT m.*, ${COUNTS} FROM meetings m ORDER BY m.held_at DESC LIMIT 50`);
  return rows.map(toMeeting);
}

export async function getMeeting(id: string): Promise<MeetingDetail | null> {
  const q = sql();
  const rows = await q.query(`SELECT m.*, ${COUNTS} FROM meetings m WHERE m.id = $1::uuid`, [id]);
  if (!rows[0]) return null;
  const att = await q`
    SELECT a.member_id, a.status, mem.name, mem.role FROM meeting_attendance a
    JOIN members mem ON mem.id = a.member_id WHERE a.meeting_id = ${id}::uuid ORDER BY mem.name`;
  return {
    ...toMeeting(rows[0]),
    attendance: att.map((r) => ({
      memberId: r.member_id as string,
      name: r.name as string,
      role: r.role as string,
      status: r.status as AttendanceStatus,
    })),
  };
}

/** Starts a meeting with every active cabinet member on the register, all marked Absent until recorded. */
export async function startMeeting(title: string, quorum: number): Promise<string> {
  // One statement, so a failure cannot leave a meeting without its register.
  const rows = await sql()`
    WITH m AS (INSERT INTO meetings (title, quorum) VALUES (${title}, ${quorum}) RETURNING id),
    a AS (
      INSERT INTO meeting_attendance (meeting_id, member_id)
      SELECT m.id, mem.id FROM m CROSS JOIN members mem WHERE mem.is_cabinet AND mem.status <> 'Inactive'
    )
    SELECT id FROM m`;
  return rows[0].id as string;
}

export async function setAttendance(meetingId: string, memberId: string, status: AttendanceStatus): Promise<boolean> {
  const rows = await sql()`
    UPDATE meeting_attendance a SET status = ${status}
    FROM meetings m
    WHERE a.meeting_id = ${meetingId}::uuid AND a.member_id = ${memberId}::uuid AND m.id = a.meeting_id AND m.status = 'open'
    RETURNING a.member_id`;
  return rows.length > 0;
}

export async function closeMeeting(id: string): Promise<boolean> {
  const rows = await sql()`UPDATE meetings SET status = 'closed', closed_at = now() WHERE id = ${id}::uuid AND status = 'open' RETURNING id`;
  return rows.length > 0;
}

export async function deleteMeeting(id: string): Promise<boolean> {
  const rows = await sql()`DELETE FROM meetings WHERE id = ${id}::uuid RETURNING id`;
  return rows.length > 0;
}
