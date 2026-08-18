import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Review from "@/models/Review";
import ProductGallery from "@/components/ProductGallery";
import ProductBuyBox from "@/components/ProductBuyBox";
import ReviewsSection from "@/components/ReviewsSection";
import type { Product as ProductType, Review as ReviewType } from "@/types";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  await connectDB();
  const product = await Product.findOne({ slug, active: true }).populate("category").lean();
  if (!product) return null;

  const reviews = await Review.find({ product: (product as unknown as { _id: string })._id, approved: true })
    .sort({ createdAt: -1 })
    .lean();

  return {
    product: JSON.parse(JSON.stringify(product)) as ProductType,
    reviews: JSON.parse(JSON.stringify(reviews)) as ReviewType[],
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) notFound();

  const { product, reviews } = data;
  const categoryName = typeof product.category === "object" ? product.category.name : "";

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">
      <div className="grid md:grid-cols-2 gap-12">
        <ProductGallery images={product.images} videos={product.videos} name={product.name} />

        <div>
          {categoryName && (
            <p className="font-mono text-[11px] uppercase tracking-widest-plus text-beige-dim mb-2">
              {categoryName}
            </p>
          )}
          <h1 className="font-display text-3xl md:text-4xl text-beige mb-6">{product.name}</h1>
          <ProductBuyBox product={product} />
          <p className="text-sm text-beige-dim leading-relaxed mt-10 whitespace-pre-line">{product.description}</p>
        </div>
      </div>

      <div className="mt-20 pt-16 border-t border-line">
        <ReviewsSection productId={product._id} initialReviews={reviews} />
      </div>
    </div>
  );
}
