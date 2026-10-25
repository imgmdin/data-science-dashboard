// Client-safe meeting types (no database imports).
export type AttendanceStatus = "Present" | "Absent" | "Excused";
export const ATTENDANCE_STATUSES: AttendanceStatus[] = ["Present", "Absent", "Excused"];

export type Meeting = {
  id: string;
  title: string;
  quorum: number;
  status: "open" | "closed";
  heldAt: string;
  closedAt: string | null;
  present: number;
  excused: number;
  total: number;
};

export type MeetingDetail = Meeting & {
  attendance: { memberId: string; name: string; role: string; status: AttendanceStatus }[];
};
