import Link from "next/link";

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 2h-3v13.2a2.8 2.8 0 1 1-2-2.68V9.4a5.8 5.8 0 1 0 5 5.75V8.3a7 7 0 0 0 4 1.25V6.5a4 4 0 0 1-4-4.5z" />
    </svg>
  );
}

export default function Footer() {
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM || "https://instagram.com/d_allure";
  const tiktok = process.env.NEXT_PUBLIC_TIKTOK || "https://tiktok.com/@d_allure";

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-12 md:grid-cols-[1.5fr_1fr_1fr] md:px-10 md:py-16 lg:px-16">
        <div>
          <div className="font-display text-2xl tracking-[0.16em] text-beige">D_ALLURE</div>
          <p className="mt-3 max-w-xs text-xs leading-6 text-beige-dim">
            Personalized perfume oils for a presence that stays with you.
          </p>
        </div>

        <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-beige-dim">
          <div className="mb-4 text-beige">Explore</div>
          <div className="flex flex-col gap-3">
            <Link href="/shop" className="transition-colors hover:text-beige">Shop all scents</Link>
            <Link href="/track" className="transition-colors hover:text-beige">Track an order</Link>
          </div>
        </div>

        <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-beige-dim">
          <div className="mb-4 text-beige">Stay in the know</div>
          <div className="flex items-center gap-4">
            <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="transition-colors hover:text-beige">
              <InstagramIcon />
            </a>
            <a href={tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="transition-colors hover:text-beige">
              <TikTokIcon />
            </a>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 border-t border-line px-6 py-5 font-mono text-[8px] uppercase tracking-[0.15em] text-beige-dim/70 sm:flex-row sm:items-center sm:justify-between md:px-10 lg:px-16">
        <span>&copy; {new Date().getFullYear()} D_ALLURE. All rights reserved.</span>
        <span>Smell expensive, stay unforgettable.</span>
      </div>
    </footer>
  );
}
