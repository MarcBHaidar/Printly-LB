import { NextResponse } from "next/server";
import { listProjects } from "../../lib/projects";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return NextResponse.json({ projects: await listProjects(false) }, { headers: { "Cache-Control": "public, max-age=30" } });
  } catch {
    return NextResponse.json({ projects: [] }, { status: 503 });
  }
}
