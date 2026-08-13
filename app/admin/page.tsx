import { headers } from "next/headers";
import { isAdminRequest } from "../lib/admin-auth";
import AdminClient from "./admin-client";
import AdminLogin from "./admin-login";
import "./admin.css";
import "./login.css";
import "./gallery.css";
import "./improvements.css";

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const headerList=await headers();
  const request=new Request("https://printly.local/admin",{headers:headerList});
  return isAdminRequest(request)?<AdminClient/>:<AdminLogin/>;
}
