import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sapphire Learning Hub｜让练习成为真正的作品",
  description: "由软件开发学习者共同维护的实践社区，在真实项目中学习协作、工程化与开源。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
