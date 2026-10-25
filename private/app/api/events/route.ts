import { createEvent, listEvents, parseEventInput } from "@/lib/events";

export async function GET() {
  try {
    return Response.json(await listEvents());
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const input = parseEventInput(await req.json().catch(() => null));
  if (typeof input === "string") return Response.json({ error: input }, { status: 400 });
  try {
    return Response.json(await createEvent(input), { status: 201 });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
