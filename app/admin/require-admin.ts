import { notFound, redirect } from "next/navigation";
import { isAdminEnabled, verifyAdmin } from "@/lib/admin-auth";

export async function requireAdmin(): Promise<void> {
  if (!isAdminEnabled) notFound();
  if (!(await verifyAdmin())) redirect("/admin/login");
}
