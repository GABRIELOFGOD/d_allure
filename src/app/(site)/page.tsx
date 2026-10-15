import Link from "next/link";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import type { Product as ProductType, Category as CategoryType } from "@/types";
import Image from "next/image";

export const dynamic = "force-dynamic";

async function getData() {
  await connectDB();
  const [featured, categories] = await Promise.all([
    Product.find({ active: true, featured: true }).populate("category").limit(8).lean(),
    Category.find().limit(6).lean(),
  ]);
  return {
    featured: JSON.parse(JSON.stringify(featured)) as ProductType[],
    categories: JSON.parse(JSON.stringify(categories)) as CategoryType[],
  };
}

export default async function Home() {
  const { featured, categories } = await getData();

  return (
    <>
      <Hero />

      <section className="border-b border-line bg-surface/50">
        <div className="mx-auto grid max-w-360 grid-cols-1 divide-y divide-line px-6 py-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 md:px-10 lg:px-16">
          {[
            ["01", "Personalized bottles", "Make a favorite scent your own"],
            ["02", "A scent to remember", "Find a fragrance that feels like you"],
            ["03", "Order tracking", "Follow your order from dispatch"],
          ].map(([number, title, detail]) => (
            <div key={number} className="flex items-center gap-4 py-4 sm:px-5 sm:py-1 first:sm:pl-0 last:sm:pr-0">
              <span className="font-mono text-[9px] tracking-[0.15em] text-burgundy-bright">{number}</span>
              <div>
                <p className="text-xs text-beige">{title}</p>
                <p className="mt-1 text-[10px] text-beige-dim">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="featured" className="mx-auto max-w-360 px-6 py-20 md:px-10 md:py-28 lg:px-16">
        <div className="mb-9 flex items-end justify-between gap-4 md:mb-12">
          <div>
            <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-burgundy-bright">
              Discover your signature scent
            </p>
            <h2 className="font-display text-4xl leading-none text-beige md:text-5xl">The signature edit</h2>
            <p className="mt-3 max-w-md text-xs leading-6 text-beige-dim md:text-sm">
              Discover the scents everyone comes back for.
            </p>
          </div>
          <Link
            href="/shop"
            className="group mb-1 hidden items-center gap-3 border-b border-line pb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-beige-dim transition-colors hover:border-beige hover:text-beige md:flex"
          >
            Explore all scents <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="border border-line bg-surface px-5 py-8 text-sm text-beige-dim">
            New scents are on their way. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-12">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
        <Link
          href="/shop"
          className="mt-8 flex items-center justify-center border border-line px-5 py-3 font-mono text-[9px] uppercase tracking-[0.16em] text-beige transition-colors hover:border-beige-dim md:hidden"
        >
          Explore all scents <span aria-hidden="true" className="ml-3">→</span>
        </Link>
      </section>

      {categories.length > 0 && (
        <section className="border-y border-line bg-surface/45">
          <div className="mx-auto max-w-360 px-6 py-16 md:px-10 md:py-20 lg:px-16">
          <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
            <div>
              <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-burgundy-bright">Find your mood</p>
              <h2 className="font-display text-4xl leading-none text-beige md:text-5xl">Shop by collection</h2>
            </div>
            <Link href="/shop" className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-beige-dim transition-colors hover:text-beige sm:block">
              View everything →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/shop?category=${cat._id}`}
                className="group relative flex aspect-[1/1.12] items-end overflow-hidden border border-line bg-surface p-4 sm:aspect-[1.25/1] sm:p-6"
              >
                <Image
                  src={cat.image || "/logo.png"}
                  alt={cat.name}
                  fill
                  className="object-cover opacity-50 transition duration-700 group-hover:scale-105 group-hover:opacity-70"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                <span className="absolute inset-0 bg-linear-to-t from-void/90 via-void/10 to-transparent" />
                <span className="relative flex w-full items-center justify-between font-display text-lg text-beige sm:text-2xl">
                  {cat.name}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-beige/35 font-sans text-sm transition-colors group-hover:border-beige group-hover:bg-beige group-hover:text-void">↗</span>
                </span>
              </Link>
            ))}
          </div>
          </div>
        </section>
      )}

      <section className="px-6 py-20 md:px-10 md:py-28">
        <div className="relative mx-auto max-w-5xl overflow-hidden border border-line bg-surface px-6 py-14 text-center sm:px-12 md:py-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(92,10,31,0.36),transparent_58%)]" />
          <div className="relative">
          <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.22em] text-burgundy-bright">A little more personal</p>
          <h2 className="font-display text-4xl leading-none text-beige md:text-6xl">Make every bottle uniquely yours.</h2>
          <p className="mx-auto mb-8 mt-5 max-w-lg text-xs leading-6 text-beige-dim md:text-sm">
            {/* Choose a customizable bottle and add a name of your choosing—for yourself or someone special. */}
            Shop a scent that matches your vibe, weather you are treating yourself or choosing a thouhgtful gift for someone special.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-7 bg-burgundy px-6 py-4 font-mono text-[9px] uppercase tracking-[0.17em] text-white transition-colors hover:bg-burgundy-bright"
          >
            Find your bottle <span aria-hidden="true">→</span>
          </Link>
          </div>
        </div>
      </section>
    </>
  );
}
