import { sql } from "./db";
import type { Member } from "./member-types";

type Row = Record<string, unknown>;

function toMember(r: Row): Member {
  return {
    id: r.id as string,
    name: r.name as string,
    email: r.email as string,
    role: r.role as string,
    department: r.department as string,
    status: r.status as Member["status"],
    isCabinet: r.is_cabinet as boolean,
  };
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const STATUSES = ["Active", "Pending", "Inactive"];

export type MemberInput = Omit<Member, "id">;

export function parseMember(body: unknown): MemberInput | string {
  if (!body || typeof body !== "object") return "Invalid body";
  const b = body as Record<string, unknown>;
  const name = str(b.name, 120);
  if (!name) return "Enter the member's name.";
  const email = str(b.email, 200);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
  const status = str(b.status, 20);
  return {
    name,
    email,
    role: str(b.role, 80) || "General Member",
    department: str(b.department, 120),
    status: (STATUSES.includes(status) ? status : "Active") as Member["status"],
    isCabinet: b.isCabinet === true,
  };
}

export async function listMembers(): Promise<Member[]> {
  const rows = await sql()`SELECT * FROM members ORDER BY is_cabinet DESC, name`;
  return rows.map(toMember);
}

export async function createMember(i: MemberInput): Promise<Member> {
  const rows = await sql()`
    INSERT INTO members (name, email, role, department, status, is_cabinet)
    VALUES (${i.name}, ${i.email}, ${i.role}, ${i.department}, ${i.status}, ${i.isCabinet}) RETURNING *`;
  return toMember(rows[0]);
}

export async function updateMember(id: string, i: MemberInput): Promise<Member | null> {
  const rows = await sql()`
    UPDATE members SET name = ${i.name}, email = ${i.email}, role = ${i.role}, department = ${i.department},
      status = ${i.status}, is_cabinet = ${i.isCabinet}
    WHERE id = ${id}::uuid RETURNING *`;
  return rows[0] ? toMember(rows[0]) : null;
}

export async function deleteMember(id: string): Promise<boolean> {
  const rows = await sql()`DELETE FROM members WHERE id = ${id}::uuid RETURNING id`;
  return rows.length > 0;
}
