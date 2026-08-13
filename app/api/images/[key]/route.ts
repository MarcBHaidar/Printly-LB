import { findFile } from "../../../lib/storage";

export const dynamic = "force-dynamic";
export async function GET(_request: Request, context: { params: Promise<{ key: string }> }) {
  const { key } = await context.params;
  const object = await findFile(key);
  if (!object) return new Response("Not found", { status: 404 });
  return Response.redirect(object.url, 307);
}
