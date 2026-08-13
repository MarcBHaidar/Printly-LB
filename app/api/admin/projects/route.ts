import { NextResponse } from "next/server";
import { isAdminRequest } from "../../../lib/admin-auth";
import { db, listProjects, slugify } from "../../../lib/projects";
import { deleteFile, uploadFile } from "../../../lib/storage";

export const dynamic = "force-dynamic";
async function authorized(request:Request){return isAdminRequest(request);}
const denied = () => NextResponse.json({ error: "Not authorized" }, { status: 403 });

export async function GET(request:Request) {
  if (!(await authorized(request))) return denied();
  return NextResponse.json({ projects: await listProjects(true) });
}

export async function POST(request: Request) {
  if (!(await authorized(request))) return denied();
  const form = await request.formData();
  const title = String(form.get("title") || "").trim();
  const category = String(form.get("category") || "").trim();
  const description = String(form.get("description") || "").trim();
  const file = form.get("image");
  if (!title || !category || !description || !(file instanceof File) || !file.size) return NextResponse.json({ error: "Complete all fields and choose an image." }, { status: 400 });
  if (!file.type.startsWith("image/") || file.size > 12 * 1024 * 1024) return NextResponse.json({ error: "Use an image under 12 MB." }, { status: 400 });
  const sql = db();
  const rows = await sql.query(`SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM projects`) as { next: number }[];
  const unique = `${slugify(title)}-${Date.now().toString(36)}`;
  const ext = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").toLowerCase();
  const key = `projects/${unique}.${ext}`;
  const imageUrl = await uploadFile(key, file);
  await sql.query(`INSERT INTO projects (title, slug, category, description, image_url, image_key, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [title, unique, category, description, imageUrl, key, Number(rows[0]?.next || 1)]);
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  if (!(await authorized(request))) return denied();
  const body = await request.json() as { id: number; title?: string; category?: string; description?: string; featured?: boolean; visible?: boolean; draft?:boolean; filter_category?:string; customer_goal?:string; solution?:string; materials?:string; finishing?:string; final_result?:string; direction?: "up" | "down"; duplicate?:boolean };
  const sql = db();
  if(body.duplicate){await sql.query(`INSERT INTO projects(title,slug,category,description,image_url,image_key,sort_order,featured,visible,draft,filter_category,customer_goal,solution,materials,finishing,final_result) SELECT title||' — Copy',slug||'-copy-'||extract(epoch from now())::bigint,category,description,image_url,NULL,(SELECT COALESCE(MAX(sort_order),0)+1 FROM projects),false,false,true,filter_category,customer_goal,solution,materials,finishing,final_result FROM projects WHERE id=$1`,[body.id]);}
  else if (body.direction) {
    const current = (await sql.query(`SELECT id, sort_order FROM projects WHERE id=$1`, [body.id]))[0] as { id:number; sort_order:number } | undefined;
    if (!current) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    const op = body.direction === "up" ? "<" : ">";
    const order = body.direction === "up" ? "DESC" : "ASC";
    const neighbor = (await sql.query(`SELECT id, sort_order FROM projects WHERE sort_order ${op} $1 ORDER BY sort_order ${order} LIMIT 1`, [current.sort_order]))[0] as { id:number; sort_order:number } | undefined;
    if (neighbor) await sql.transaction(tx => [
      tx.query(`UPDATE projects SET sort_order=$1, updated_at=NOW() WHERE id=$2`, [neighbor.sort_order, current.id]),
      tx.query(`UPDATE projects SET sort_order=$1, updated_at=NOW() WHERE id=$2`, [current.sort_order, neighbor.id]),
    ]);
  } else {
    await sql.query(`UPDATE projects SET title=COALESCE($1,title), category=COALESCE($2,category), description=COALESCE($3,description), featured=COALESCE($4,featured), visible=COALESCE($5,visible), draft=COALESCE($6,draft),filter_category=COALESCE($7,filter_category),customer_goal=COALESCE($8,customer_goal),solution=COALESCE($9,solution),materials=COALESCE($10,materials),finishing=COALESCE($11,finishing),final_result=COALESCE($12,final_result), updated_at=NOW() WHERE id=$13`, [body.title ?? null, body.category ?? null, body.description ?? null, body.featured ?? null, body.visible ?? null,body.draft??null,body.filter_category??null,body.customer_goal??null,body.solution??null,body.materials??null,body.finishing??null,body.final_result??null,body.id]);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await authorized(request))) return denied();
  const id = Number(new URL(request.url).searchParams.get("id"));
  const sql = db();
  const rows = await sql.query(`DELETE FROM projects WHERE id=$1 RETURNING image_key`, [id]) as { image_key: string | null }[];
  await deleteFile(rows[0]?.image_key);
  return NextResponse.json({ ok: true });
}
