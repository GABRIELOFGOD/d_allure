"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingBag, ArrowUpRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Marquee from "./Marquee";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/track", label: "Track Order" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, setIsOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-void/95 backdrop-blur-xl">
      <Marquee />
      <div className="mx-auto flex max-w-360 items-center justify-between px-5 py-3.5 md:px-10 lg:px-16">
        <button
          className="text-beige md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/" className="flex items-center gap-2.5 text-beige">
          <Image src="/logo.png" alt="D_ALLURE" width={95} height={38} className="object-contain" />
          <span className="hidden font-display text-lg tracking-[0.16em] md:inline">D_ALLURE</span>
        </Link>

        <nav className="hidden items-center gap-9 font-mono text-[10px] uppercase tracking-[0.17em] text-beige-dim md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-beige">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/shop"
            className="hidden items-center gap-2 border border-line px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.14em] text-beige transition-colors hover:border-beige-dim sm:flex"
          >
            Discover scents <ArrowUpRight size={13} />
          </Link>
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-2 text-beige transition-colors hover:text-white"
            aria-label="Open cart"
          >
            <ShoppingBag size={19} />
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.13em] sm:inline">Bag</span>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-burgundy-bright px-1 font-mono text-[9px] text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-line bg-surface px-5 pb-5 pt-3 font-mono text-[10px] uppercase tracking-[0.17em] text-beige-dim md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-2 border-b border-line"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
