import { notFound } from "next/navigation";
import { isAdminEnabled } from "@/lib/admin-auth";
import { countAdminUsers } from "@/lib/queries";
import LoginForm from "./LoginForm";
import SetupForm from "./SetupForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (!isAdminEnabled) notFound();
  let needsSetup = false;
  try {
    needsSetup = (await countAdminUsers()) === 0;
  } catch (error) {
    console.error("[admin/login]", error);
  }
  return (
    <main className="admin-login">
      {needsSetup ? <SetupForm /> : <LoginForm />}
    </main>
  );
}
