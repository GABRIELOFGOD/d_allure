import Link from "next/link";
import { ArrowDown, ArrowUpRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-void">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_48%,rgba(92,10,31,0.2),transparent_45%)]" />
      <div className="mx-auto grid min-h-170 max-w-360 items-center px-6 py-10 sm:px-10 lg:min-h-180 lg:grid-cols-[0.92fr_1.08fr] lg:px-16">
        <div className="relative z-10 order-1 max-w-2xl pb-10 pt-6 lg:py-20">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-4 py-2 text-beige-dim">
            <Sparkles size={13} className="text-burgundy-bright" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
              Personalized perfume oils
            </span>
          </div>
          <h1 className="font-display text-[clamp(3.65rem,7.7vw,7.2rem)] leading-[0.90] tracking-[-0.055em] text-beige">
            Your scent
            <br />
            <span className="text-beige-dim">your signature</span>
            <br />
            your ALLURE.
          </h1>
          <p className="mt-7 max-w-md text-sm leading-7 text-beige-dim sm:text-base">
            Find a fragrance that matches your personality and make it uniquely yours with a personalized bottle.
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

        <div className="relative flex right-auto md:ml-5 order-2 h-90 min-h-0 overflow-hidden sm:h-117.5 lg:h-162.5">
          <div
            role="img"
            aria-label="An amber perfume bottle displayed on a glowing pedestal"
            className="absolute inset-0"
          >
            <svg
              aria-hidden="true"
              className="h-full w-full"
              viewBox="0 0 900 800"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <radialGradient id="hero-glow" cx="0" cy="0" r="1" gradientTransform="matrix(0 410 -390 0 470 355)" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#812A2B" stopOpacity=".34" />
                  <stop offset="1" stopColor="#100B0A" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="bottle-glass" x1="340" y1="390" x2="565" y2="680" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#D59B68" stopOpacity=".84" />
                  <stop offset=".42" stopColor="#713324" stopOpacity=".96" />
                  <stop offset="1" stopColor="#281513" />
                </linearGradient>
                <linearGradient id="bottle-edge" x1="350" y1="490" x2="552" y2="490" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F1B686" stopOpacity=".76" />
                  <stop offset=".48" stopColor="#F1B686" stopOpacity=".08" />
                  <stop offset="1" stopColor="#F1B686" stopOpacity=".56" />
                </linearGradient>
                <linearGradient id="gold" x1="404" y1="300" x2="501" y2="352" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F5D7A4" />
                  <stop offset=".5" stopColor="#A66D37" />
                  <stop offset="1" stopColor="#E8C68E" />
                </linearGradient>
                <linearGradient id="plinth" x1="252" y1="690" x2="654" y2="744" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#261514" />
                  <stop offset=".5" stopColor="#51302A" />
                  <stop offset="1" stopColor="#1B1110" />
                </linearGradient>
              </defs>

              <path fill="url(#hero-glow)" d="M0 0h900v800H0z" />
              <circle cx="470" cy="390" r="285" stroke="#E2B481" strokeOpacity=".08" />
              <circle cx="470" cy="390" r="326" stroke="#E2B481" strokeOpacity=".06" />
              <path d="M98 642c110-37 202-55 373-55 128 0 238 18 331 54" stroke="#E2B481" strokeOpacity=".18" />
              <ellipse cx="468" cy="704" rx="205" ry="24" fill="#050303" fillOpacity=".58" />
              <ellipse cx="468" cy="697" rx="148" ry="13" fill="#C17C51" fillOpacity=".15" />

              <g stroke="#D7A879" strokeOpacity=".55" strokeWidth="1.5">
                <path d="M202 622c21-77 25-151 5-224 44 59 61 120 53 183" />
                <path d="M211 487c-31-13-50-34-57-64 28 6 48 23 59 50M219 524c31-16 54-39 67-69-34 11-56 32-68 63M207 450c-21-17-33-39-35-66 22 12 36 31 40 55M229 565c28-8 51-24 68-48-33 4-57 19-73 43" />
                <path d="M712 604c-13-53-11-103 9-151-35 36-54 79-57 128" />
                <path d="M712 493c25-10 41-26 48-48-24 5-41 18-50 39M700 532c-25-12-43-31-54-56 28 9 47 27 57 51" />
              </g>

              <g fill="#E9C28E">
                <path d="m647 243 4 11 11 4-11 4-4 11-4-11-11-4 11-4 4-11ZM274 292l3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" />
                <circle cx="626" cy="285" r="2" />
                <circle cx="293" cy="327" r="2" />
                <circle cx="661" cy="315" r="1.5" />
              </g>

              <g>
                <path d="M400 330h137v37H400z" fill="#271816" stroke="url(#gold)" strokeWidth="2" />
                <path d="M413 335h111v27H413z" stroke="#E8C68E" strokeOpacity=".35" />
                <path d="M422 303h94v27h-94z" fill="url(#gold)" />
                <path d="M430 294c0-8 6-14 14-14h50c8 0 14 6 14 14v9h-78v-9Z" fill="#211412" stroke="url(#gold)" strokeWidth="2" />
                <path d="M445 280v-12h48v12" stroke="#E8C68E" strokeOpacity=".65" strokeWidth="2" />
                <rect x="347" y="360" width="242" height="310" rx="35" fill="url(#bottle-glass)" stroke="url(#bottle-edge)" strokeWidth="3" />
                <path d="M364 390c0-9 7-16 16-16h176c9 0 16 7 16 16v245c0 8-6 15-14 17" stroke="#FFE0B0" strokeOpacity=".25" strokeWidth="2" />
                <path d="M367 409v187" stroke="#FFF0D7" strokeOpacity=".34" strokeWidth="5" strokeLinecap="round" />
                <path d="M568 418v198" stroke="#F2C38A" strokeOpacity=".15" strokeWidth="3" strokeLinecap="round" />
                <rect x="378" y="443" width="180" height="154" rx="3" fill="#E9D4B6" fillOpacity=".94" />
                <rect x="386" y="451" width="164" height="138" stroke="#806045" strokeOpacity=".58" />
                <path d="M401 472h134" stroke="#8B5B3C" strokeOpacity=".38" />
                <text x="468" y="515" fill="#351B17" textAnchor="middle" fontFamily="Georgia,serif" fontSize="22" letterSpacing="5">D’ALLURE</text>
                <text x="468" y="544" fill="#76503B" textAnchor="middle" fontFamily="Georgia,serif" fontSize="10" letterSpacing="3">PARFUM DE LUXE</text>
                <path d="M444 561h48" stroke="#A7784D" strokeWidth="1" />
                <text x="468" y="578" fill="#76503B" textAnchor="middle" fontFamily="Georgia,serif" fontSize="8" letterSpacing="2">30 ML · PARIS</text>
              </g>

              <path d="M260 691h416l-28 47H288l-28-47Z" fill="url(#plinth)" stroke="#A66D4B" strokeOpacity=".4" />
              <path d="M278 696h380" stroke="#E5B37B" strokeOpacity=".35" />
              <path d="M293 738h350" stroke="#E5B37B" strokeOpacity=".17" />
            </svg>
          </div>
          <div className="pointer-events-none absolute bottom-5 right-3 z-20 hidden border border-line/80 bg-void/60 px-4 py-3 backdrop-blur-sm sm:block lg:right-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-beige-dim">Your scent</p>
            <p className="mt-1 font-display text-lg text-beige">Your signature.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
