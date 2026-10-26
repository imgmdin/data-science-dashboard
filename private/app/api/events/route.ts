import { createEvent, listEvents, parseEventInput } from "@/lib/events";
import { guard } from "@/lib/http";

export const GET = () => guard(async () => Response.json(await listEvents()));

export const POST = (req: Request) =>
  guard(async () => {
    const input = parseEventInput(await req.json().catch(() => null));
    if (typeof input === "string") return Response.json({ error: input }, { status: 400 });
    return Response.json(await createEvent(input), { status: 201 });
  });
