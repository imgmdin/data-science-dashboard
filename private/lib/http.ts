/** Runs a route handler; database failures become clean JSON errors instead of leaking driver messages. */
export async function guard(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    console.error(e);
    // Missing configuration is worth showing as-is; it contains no data.
    if (e instanceof Error && e.message.startsWith("DATABASE_URL is not set")) return Response.json({ error: e.message }, { status: 500 });
    // 23503 = foreign key violation (e.g. linking an event to a certificate that no longer exists).
    if ((e as { code?: string }).code === "23503") {
      return Response.json({ error: "That item refers to something that no longer exists. Refresh and try again." }, { status: 400 });
    }
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
