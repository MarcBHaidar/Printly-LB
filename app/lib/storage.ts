import { del, list, put } from "@vercel/blob";

export async function uploadFile(key: string, file: File) {
  const blob = await put(key, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type || "application/octet-stream",
  });
  return blob.url;
}

export async function deleteFile(reference: string | null | undefined) {
  if (!reference) return;
  await del(reference);
}

export async function findFile(key: string) {
  const result = await list({ prefix: key, limit: 1 });
  return result.blobs.find((blob) => blob.pathname === key) ?? null;
}
