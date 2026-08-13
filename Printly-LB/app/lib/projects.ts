import { neon } from "@neondatabase/serverless";

export type Project = {
  id: number; title: string; slug: string; category: string; description: string;
  image_url: string; image_key: string | null; sort_order: number;
  featured: boolean; visible: boolean;
  filter_category:string; customer_goal:string; solution:string; materials:string; finishing:string; final_result:string; draft:boolean;
  gallery: Array<{id:number;image_url:string;caption:string;sort_order:number}>;
};

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

export async function listProjects(includeHidden = false) {
  const sql = db();
  return await sql.query(
    `SELECT p.id, p.title, p.slug, p.category, p.description, p.image_url, p.image_key,
            p.sort_order, p.featured, p.visible, p.filter_category, p.customer_goal, p.solution, p.materials, p.finishing, p.final_result, p.draft,
            COALESCE((SELECT json_agg(json_build_object('id',pi.id,'image_url',pi.image_url,'caption',pi.caption,'sort_order',pi.sort_order) ORDER BY pi.sort_order,pi.id) FROM project_images pi WHERE pi.project_id=p.id),'[]'::json) AS gallery
       FROM projects p
      ${includeHidden ? "" : "WHERE visible = true AND draft = false"}
      ORDER BY p.featured DESC, p.sort_order ASC, p.id ASC`,
  ) as Project[];
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
