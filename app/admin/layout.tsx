import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理后台｜Sapphire Learning Hub",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin-root">{children}</div>;
}
