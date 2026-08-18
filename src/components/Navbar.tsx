"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingBag, Search } from "lucide-react";
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
    <header className="sticky top-0 z-40 bg-void/95 backdrop-blur border-b border-line">
      <Marquee />
      <div className="flex items-center justify-between px-5 md:px-10 py-4">
        <button
          className="md:hidden text-beige"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/" className="font-display flex items-center gap-2 text-xl md:text-xl tracking-widest-plus text-beige">
          <Image src="/logo.png" alt="Logo" width={120} height={40} className="object-contain" />
          <p>D_ALLURE</p>
        </Link>

        <nav className="hidden md:flex items-center gap-10 font-mono text-[11px] tracking-widest-plus uppercase text-beige-dim">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-beige transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link href="/shop" className="hidden md:block text-beige-dim hover:text-beige transition-colors" aria-label="Shop">
            <Search size={18} />
          </Link>
          <button
            onClick={() => setIsOpen(true)}
            className="relative text-beige hover:text-white transition-colors"
            aria-label="Open cart"
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-burgundy-bright text-white text-[10px] font-mono w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden flex flex-col gap-1 px-5 pb-5 font-mono text-xs tracking-widest-plus uppercase text-beige-dim">
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
