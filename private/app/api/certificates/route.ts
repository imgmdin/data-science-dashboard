import { createCertificate, listCertificates, parseInput } from "@/lib/certificates";

export async function GET() {
  try {
    return Response.json(await listCertificates());
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const input = parseInput(await req.json().catch(() => null));
  if (typeof input === "string") return Response.json({ error: input }, { status: 400 });
  try {
    return Response.json(await createCertificate(input), { status: 201 });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
