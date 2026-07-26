import Link from "next/link";

export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
    </span>
  );
}

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="返回首页">
        <BrandMark />
        <span>Sapphire Learning Hub</span>
      </Link>
      <nav aria-label="主导航">
        <Link href="/projects">项目</Link>
        <Link href="/community">社区</Link>
        <Link href="/#path">学习路径</Link>
        <Link href="/#about">关于我们</Link>
        <Link href="/#join">加入</Link>
      </nav>
    </header>
  );
}
