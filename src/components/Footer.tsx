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
    <footer className="border-t border-line bg-surface mt-24">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <div className="font-display text-xl tracking-widest-plus text-beige">D_ALLURE</div>
          <p className="font-mono text-[11px] tracking-widest-plus uppercase text-beige-dim mt-3">
            Smell expensive, stay unforgettable
          </p>
        </div>

        <div className="font-mono text-xs tracking-widest-plus uppercase text-beige-dim">
          <div className="text-beige mb-3">Navigate</div>
          <div className="flex flex-col gap-2">
            <Link href="/shop" className="hover:text-beige transition-colors">Shop</Link>
            <Link href="/track" className="hover:text-beige transition-colors">Track Order</Link>
          </div>
        </div>

        <div className="font-mono text-xs tracking-widest-plus uppercase text-beige-dim">
          <div className="text-beige mb-3">Follow</div>
          <div className="flex items-center gap-4">
            <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-beige transition-colors">
              <InstagramIcon />
            </a>
            <a href={tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:text-beige transition-colors">
              <TikTokIcon />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-line px-6 md:px-10 py-5 font-mono text-[10px] tracking-widest-plus uppercase text-beige-dim/70 text-center">
        &copy; {new Date().getFullYear()} D_ALLURE. All rights reserved.
      </div>
    </footer>
  );
}
