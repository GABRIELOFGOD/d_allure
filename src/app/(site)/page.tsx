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

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-mono text-[11px] tracking-widest-plus uppercase text-beige-dim mb-2">
              Signature Selects
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-beige">Featured Scents</h2>
          </div>
          <Link
            href="/shop"
            className="hidden md:block font-mono text-xs tracking-widest-plus uppercase text-beige-dim hover:text-beige transition-colors"
          >
            View All →
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="text-beige-dim font-mono text-sm">New scents are on their way. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-24">
          <p className="font-mono text-[11px] tracking-widest-plus uppercase text-beige-dim mb-2">Curated By</p>
          <h2 className="font-display text-3xl md:text-4xl text-beige mb-10">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/shop?category=${cat._id}`}
                className="group relative aspect-3/4 bg-surface border border-line overflow-hidden flex items-end p-5"
              >
                  <Image
                    src={cat.image ? cat.image : "/logo.png"}
                    alt={cat.name}
                    fill
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  />
                <span className="relative font-display text-lg text-beige">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-line">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-24 text-center">
          <h2 className="font-display text-3xl md:text-5xl text-beige mb-5">Make It Yours</h2>
          <p className="text-beige-dim max-w-xl mx-auto mb-8">
            Every customizable bottle can carry a name of your choosing — yours, or someone
            you&apos;re gifting an unforgettable moment.
          </p>
          <Link
            href="/shop"
            className="inline-block border border-beige-dim text-beige px-8 py-4 font-mono text-xs tracking-widest-plus uppercase hover:border-beige transition-colors"
          >
            Start Customizing
          </Link>
        </div>
      </section>
    </>
  );
}
