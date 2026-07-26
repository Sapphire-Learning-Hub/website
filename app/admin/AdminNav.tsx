"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  ["/admin", "概览"],
  ["/admin/joins", "申请"],
  ["/admin/announcements", "公告"],
] as const;

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="admin-header">
      <Link className="admin-brand" href="/">
        <span className="brand-mark" aria-hidden="true">
          <span />
        </span>
        <span>SAPPHIRE / ADMIN</span>
      </Link>
      <nav aria-label="后台导航">
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className={pathname === href ? "active" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      <button type="button" className="admin-logout" onClick={logout}>
        退出 ↗
      </button>
    </header>
  );
}
