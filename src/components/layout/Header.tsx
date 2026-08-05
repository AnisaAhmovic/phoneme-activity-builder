import Link from "next/link";

import Navigation from "@/components/layout/Navigation";

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="site-brand" href="/">
          Phoneme Activity Builder
        </Link>

        <Navigation />
      </div>
    </header>
  );
}