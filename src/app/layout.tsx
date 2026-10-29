import type { Metadata } from "next";
import { Bodoni_Moda, Manrope, Space_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import ToasterProvider from "@/components/ToasterProvider";
import { absoluteUrl, siteUrl } from "@/lib/seo";

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
  metadataBase: new URL(siteUrl),
  title: {
    default: "D_ALLURE — Smell Expensive, Stay Unforgettable",
    template: "%s | D_ALLURE",
  },
  description:
    "D_ALLURE is a personalized perfume oil house. Discover signature scents, customize your bottle, and order directly on WhatsApp.",
  applicationName: "D_ALLURE",
  keywords: ["perfume oils", "fragrance", "personalized perfume", "D_ALLURE"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "D_ALLURE",
    title: "D_ALLURE — Smell Expensive, Stay Unforgettable",
    description: "Discover signature scents and personalized perfume oils from D_ALLURE.",
    url: siteUrl,
    images: [{ url: absoluteUrl("/logo.png"), alt: "D_ALLURE" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "D_ALLURE — Smell Expensive, Stay Unforgettable",
    description: "Discover signature scents and personalized perfume oils from D_ALLURE.",
    images: [absoluteUrl("/logo.png")],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/logo.png" },
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
