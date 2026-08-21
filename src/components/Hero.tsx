"use client";

import Spline from "@splinetool/react-spline/next";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="flex w-full flex-col overflow-hidden bg-void md:min-h-[640px] md:flex-row">
      <div className="relative order-1 h-[58vh] min-h-[420px] w-full md:order-2 md:h-[92vh] md:w-1/2">
        <Spline scene="https://prod.spline.design/sMCP0g1ssiU-610i/scene.splinecode" />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/40 to-transparent" />
      </div>

      <div className="order-2 flex min-h-[420px] w-full flex-col justify-center px-6 py-16 md:order-1 md:min-h-0 md:w-1/2 md:px-12 md:py-20">
        <p className="font-mono text-[11px] tracking-widest-plus uppercase text-beige-dim mb-4">
          Personalized Perfume Oils
        </p>
        <h1 className="font-display text-5xl md:text-8xl text-beige leading-[0.95] max-w-3xl">
          Smell Expensive,
          <br />
          Stay Unforgettable.
        </h1>
        <div className="mt-8">
          <Link
            href="/shop"
            className="inline-block bg-burgundy hover:bg-burgundy-bright text-white px-8 py-4 font-mono text-xs tracking-widest-plus uppercase transition-colors"
          >
            Explore The Collection
          </Link>
        </div>
      </div>
    </section>
  );
}
