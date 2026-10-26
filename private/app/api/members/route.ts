import { guard } from "@/lib/http";
import { createMember, listMembers, parseMember } from "@/lib/members";

export const GET = () => guard(async () => Response.json(await listMembers()));

export const POST = (req: Request) =>
  guard(async () => {
    const input = parseMember(await req.json().catch(() => null));
    if (typeof input === "string") return Response.json({ error: input }, { status: 400 });
    return Response.json(await createMember(input), { status: 201 });
  });
