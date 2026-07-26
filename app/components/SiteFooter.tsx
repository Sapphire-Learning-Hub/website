import VisitCounter from "./VisitCounter";
import { ArrowUpRight } from "./icons";
import { BrandMark } from "./SiteHeader";

const githubUrl = "https://github.com/Sapphire-Learning-Hub";

export default function SiteFooter({
  visitTotal,
}: {
  visitTotal: number | null;
}) {
  return (
    <footer>
      <div className="footer-brand"><BrandMark /><span>Sapphire Learning Hub</span></div>
      <p>
        Make practice visible. Make progress real.
        <VisitCounter initialTotal={visitTotal} />
      </p>
      <a href={githubUrl} target="_blank" rel="noreferrer">GitHub <ArrowUpRight /></a>
    </footer>
  );
}
