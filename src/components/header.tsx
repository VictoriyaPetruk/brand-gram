 "use client";

import { useState } from "react";
import Link from "next/link";
import { CharacterMascot } from "@/components/ui/CharacterMascot";

type NavItem = {
  href: string;
  label: string;
  primary?: boolean;
};

const navItems: NavItem[] = [
  { href: "/create", label: "Create website", primary: true },
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/saved", label: "Saved Ideas" },
  { href: "/saved-posts", label: "Saved Posts" },
  { href: "/saved-accounts", label: "Saved Accounts" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-card/85 px-3 sm:px-6 py-2 sm:py-3 shadow-soft backdrop-blur-md">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-3">
        <div className="flex items-center">
          <Link
            href="/"
            className="mr-3 flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-xl bg-white p-0.5 shadow-sm ring-1 ring-border/25"
            aria-label="Home"
            onClick={closeMenu}
          >
            <div className="scale-[0.48] sm:scale-[0.52] origin-center">
              <CharacterMascot energy={8} sessionType="hobby" size="compact" showSublabel={false} />
            </div>
          </Link>
          <h1 className="text-foreground text-base sm:text-lg font-bold tracking-tight">
            Content Lab
          </h1>
        </div>

        {/* Desktop nav */}
        <nav className="hidden sm:block">
          <ul className="flex items-center space-x-2 sm:space-x-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    item.primary
                      ? "rounded-full bg-brand-gradient px-3 py-1.5 text-sm font-semibold text-white shadow-soft hover:opacity-90 transition-opacity"
                      : "rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  }
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-border bg-background/80 px-3 py-2 text-xs font-medium text-foreground shadow-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
        >
          <span className="mr-2">Menu</span>
          <span className="flex flex-col gap-[3px]">
            <span
              className={`h-[2px] w-4 rounded-full bg-foreground transition-transform ${
                menuOpen ? "translate-y-[5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[2px] w-4 rounded-full bg-foreground transition-opacity ${
                menuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`h-[2px] w-4 rounded-full bg-foreground transition-transform ${
                menuOpen ? "-translate-y-[5px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      <nav
        className={`sm:hidden transition-[max-height,opacity] duration-200 ease-out ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <ul className="mt-2 flex flex-col gap-1 rounded-2xl border border-border/60 bg-card/95 p-2 shadow-soft">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={closeMenu}
                className={
                  item.primary
                    ? "block w-full rounded-full bg-brand-gradient px-4 py-2 text-center text-sm font-semibold text-white shadow-soft hover:opacity-90 transition-opacity"
                    : "block w-full rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-center"
                }
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;