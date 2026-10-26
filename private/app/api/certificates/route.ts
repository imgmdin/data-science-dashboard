import { createCertificate, listCertificates, parseInput } from "@/lib/certificates";
import { guard } from "@/lib/http";

export const GET = () => guard(async () => Response.json(await listCertificates()));

export const POST = (req: Request) =>
  guard(async () => {
    const input = parseInput(await req.json().catch(() => null));
    if (typeof input === "string") return Response.json({ error: input }, { status: 400 });
    return Response.json(await createCertificate(input), { status: 201 });
  });
