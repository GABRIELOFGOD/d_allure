"use client";

import Spline from "@splinetool/react-spline/next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-void">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_48%,rgba(92,10,31,0.2),transparent_45%)]" />
      <div className="mx-auto grid min-h-[680px] max-w-[1440px] items-center px-6 py-10 sm:px-10 lg:min-h-[720px] lg:grid-cols-[0.92fr_1.08fr] lg:px-16">
        <div className="relative z-10 order-1 max-w-2xl pb-10 pt-6 lg:py-20">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-4 py-2 text-beige-dim">
            <Sparkles size={13} className="text-burgundy-bright" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
              Personalized perfume oils
            </span>
          </div>
          <h1 className="font-display text-[clamp(3.65rem,7.7vw,7.2rem)] leading-[0.86] tracking-[-0.055em] text-beige">
            Wear your
            <br />
            <span className="text-beige-dim">own kind</span>
            <br />
            of allure.
          </h1>
          <p className="mt-7 max-w-md text-sm leading-7 text-beige-dim sm:text-base">
            Find a scent that feels like you. Make it even more personal with a name
            engraved just for you.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-8 bg-burgundy px-6 py-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-burgundy-bright"
            >
              Shop the collection
              <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#featured"
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-beige-dim transition-colors hover:text-beige"
            >
              Discover D_ALLURE <ArrowDown size={13} />
            </Link>
          </div>
          <div className="mt-14 hidden items-center gap-3 border-t border-line pt-5 sm:flex">
            <span className="h-px w-8 bg-burgundy-bright" />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-beige-dim">
              Made personal. Remembered forever.
            </span>
          </div>
        </div>

        <div className="relative order-2 h-[360px] min-h-0 overflow-hidden sm:h-[470px] lg:h-[650px]">
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-void/45 via-transparent to-void/10 lg:bg-gradient-to-r lg:from-void/25 lg:via-transparent lg:to-transparent" />
          <Spline scene="https://prod.spline.design/sMCP0g1ssiU-610i/scene.splinecode" />
          <div className="pointer-events-none absolute bottom-5 right-3 z-20 hidden border border-line/80 bg-void/60 px-4 py-3 backdrop-blur-sm sm:block lg:right-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-beige-dim">Your scent</p>
            <p className="mt-1 font-display text-lg text-beige">Your signature.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
