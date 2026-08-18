import type { Metadata } from "next";
import { Bodoni_Moda, Manrope, Space_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import ToasterProvider from "@/components/ToasterProvider";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  weight: ["500", "600", "700"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "D_ALLURE — Smell Expensive, Stay Unforgettable",
  description:
    "D_ALLURE is a personalized perfume oil house. Discover signature scents, customize your bottle, and order directly on WhatsApp.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bodoni.variable} ${manrope.variable} ${spaceMono.variable} antialiased`}>
        <CartProvider>
          {children}
          <ToasterProvider />
        </CartProvider>
      </body>
    </html>
  );
}
