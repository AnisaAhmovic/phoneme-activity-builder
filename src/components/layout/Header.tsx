import Link from "next/link";

import Navigation from "@/components/layout/Navigation";

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="site-brand" href="/">
          <span className="site-brand__assessment">
            Backend and database integration
          </span>
          <span className="site-brand__project">Phoneme Activity Builder</span>
        </Link>

        <Navigation />
      </div>
    </header>
  );
}
