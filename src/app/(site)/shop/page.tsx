import Link from "next/link";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductCard from "@/components/ProductCard";
import type { Product as ProductType, Category as CategoryType } from "@/types";

export const dynamic = "force-dynamic";

async function getData(categoryId?: string) {
  await connectDB();
  const query: Record<string, unknown> = { active: true };
  if (categoryId) query.category = categoryId;

  const [products, categories] = await Promise.all([
    Product.find(query).populate("category").sort({ createdAt: -1 }).lean(),
    Category.find().sort({ name: 1 }).lean(),
  ]);
  return {
    products: JSON.parse(JSON.stringify(products)) as ProductType[],
    categories: JSON.parse(JSON.stringify(categories)) as CategoryType[],
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const { products, categories } = await getData(category);
  const activeCategory = categories.find((item) => item._id === category)?.name;

  return (
    <div className="mx-auto max-w-[1440px] px-6 pb-20 pt-12 md:px-10 md:pb-28 md:pt-16 lg:px-16">
      <div className="border-b border-line pb-9 md:pb-12">
        <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-burgundy-bright">The D_ALLURE edit</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-5xl leading-none text-beige md:text-7xl">
              {activeCategory || "Find your signature."}
            </h1>
            <p className="mt-4 max-w-lg text-xs leading-6 text-beige-dim md:text-sm">
              Explore the collection. Find a favorite, or make a bottle your own.
            </p>
          </div>
          <p className="pb-1 font-mono text-[9px] uppercase tracking-[0.16em] text-beige-dim">
            {products.length} {products.length === 1 ? "scent" : "scents"}
          </p>
        </div>
      </div>

      <nav aria-label="Filter products by category" className="-mx-6 flex gap-2 overflow-x-auto px-6 py-6 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:py-8">
        <Link
          href="/shop"
          aria-current={!category ? "page" : undefined}
          className={`shrink-0 border px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.15em] transition-colors ${
            !category ? "border-beige bg-beige text-void" : "border-line text-beige-dim hover:border-beige-dim hover:text-beige"
          }`}
        >
          All scents
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat._id}
            href={`/shop?category=${cat._id}`}
            aria-current={category === cat._id ? "page" : undefined}
            className={`shrink-0 border px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.15em] transition-colors ${
              category === cat._id ? "border-beige bg-beige text-void" : "border-line text-beige-dim hover:border-beige-dim hover:text-beige"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </nav>

      {products.length === 0 ? (
        <div className="border border-line bg-surface px-6 py-12 text-center">
          <p className="font-display text-2xl text-beige">No scents here just yet.</p>
          <p className="mt-2 text-xs text-beige-dim">Try another collection to find your next favorite.</p>
          {category && <Link href="/shop" className="mt-5 inline-block font-mono text-[9px] uppercase tracking-[0.16em] text-beige underline underline-offset-4">Browse all scents</Link>}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-12">
          {products.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      )}
    </div>
  );
}
