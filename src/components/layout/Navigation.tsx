"use client";

import Link from "next/link";
import { useState } from "react";

const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about", label: "About" },
  { href: "/wordle", label: "Wordle" },
  { href: "/word-search", label: "Word Search" },
  { href: "/library", label: "Teacher Library" },
  { href: "/settings", label: "Settings" },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        aria-controls="primary-navigation"
        aria-expanded={isOpen}
        aria-label="Toggle navigation menu"
        className="site-navigation-toggle"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      <nav
        aria-label="Primary navigation"
        className={`site-navigation${isOpen ? " site-navigation--open" : ""}`}
        id="primary-navigation"
      >
        <ul className="site-navigation__list">
          {navigationLinks.map((link) => (
            <li key={link.href}>
              <Link
                className="site-navigation__link"
                href={link.href}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
