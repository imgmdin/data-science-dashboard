import { COOKIE, safeEqual, sessionToken } from "@/lib/auth";

const MONTH = 60 * 60 * 24 * 30;

export async function POST(req: Request) {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) return Response.json({ ok: true });
  const b = (await req.json().catch(() => null)) as { password?: unknown } | null;
  const given = typeof b?.password === "string" ? b.password : "";
  const token = await sessionToken(password);
  if (!safeEqual(await sessionToken(given), token)) {
    await new Promise((r) => setTimeout(r, 500)); // slow down guessing
    return Response.json({ error: "That password is not correct." }, { status: 401 });
  }
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MONTH}${secure}` } },
  );
}

/** Sign out. */
export async function DELETE() {
  return Response.json({ ok: true }, { headers: { "Set-Cookie": `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0` } });
}
