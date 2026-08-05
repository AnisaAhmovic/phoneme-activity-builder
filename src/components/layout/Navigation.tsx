import Link from "next/link";

const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/wordle", label: "Wordle" },
  { href: "/word-search", label: "Word Search" },
  { href: "/settings", label: "Settings" },
];

export default function Navigation() {
  return (
    <nav aria-label="Primary navigation" className="site-navigation">
      <ul className="site-navigation__list">
        {navigationLinks.map((link) => (
          <li key={link.href}>
            <Link className="site-navigation__link" href={link.href}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
