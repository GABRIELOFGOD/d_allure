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

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-16">
      <p className="font-mono text-[11px] tracking-widest-plus uppercase text-beige-dim mb-2">The Collection</p>
      <h1 className="font-display text-4xl md:text-5xl text-beige mb-10">Shop All Scents</h1>

      <div className="flex flex-wrap gap-3 mb-12 font-mono text-xs tracking-widest-plus uppercase">
        <Link
          href="/shop"
          className={`px-4 py-2 border ${!category ? "border-beige text-beige" : "border-line text-beige-dim hover:text-beige"}`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat._id}
            href={`/shop?category=${cat._id}`}
            className={`px-4 py-2 border ${category === cat._id ? "border-beige text-beige" : "border-line text-beige-dim hover:text-beige"}`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-beige-dim font-mono text-sm">No products found in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
