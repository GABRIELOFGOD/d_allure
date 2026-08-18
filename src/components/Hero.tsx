"use client";

import Spline from "@splinetool/react-spline/next";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full h-[92vh] min-h-[640px] overflow-hidden bg-void">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/sMCP0g1ssiU-610i/scene.splinecode" />
      </div>

      {/* Gradient scrim so text stays legible over the 3D scene without flattening it */}
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/10 to-transparent pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-12 pb-20 pointer-events-none">
        <p className="font-mono text-[11px] tracking-widest-plus uppercase text-beige-dim mb-4">
          Personalized Perfume Oils
        </p>
        <h1 className="font-display text-5xl md:text-8xl text-beige leading-[0.95] max-w-3xl">
          Smell Expensive,
          <br />
          Stay Unforgettable.
        </h1>
        <div className="mt-8 pointer-events-auto">
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
