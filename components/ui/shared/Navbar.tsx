"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Tabla de colores" },
  { href: "/contraste", label: "Colores de contraste" },
  { href: "/gradientes", label: "Gradientes / Degradados" },
  { href: "/gotero", label: "Gotero" },
  { href: "/acercaDe", label: "Acerca de" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-wide">Color Tools</Link>

        {/* Desktop */}
        <ul className="hidden gap-1 md:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`rounded-lg px-3 py-2 text-sm transition ${
                    active ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white md:hidden"
          aria-label="Abrir menú"
        >
          ☰
        </button>
      </nav>

      {/* Drawer móvil */}
      {open && (
        <div className="border-t border-white/10 md:hidden">
          <ul className="mx-auto max-w-6xl px-4 py-2">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-3 py-2 text-sm ${
                      active ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
