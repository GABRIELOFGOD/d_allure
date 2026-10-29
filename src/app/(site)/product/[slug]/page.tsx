import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Review from "@/models/Review";
import { absoluteUrl } from "@/lib/seo";
import ProductGallery from "@/components/ProductGallery";
import ProductBuyBox from "@/components/ProductBuyBox";
import ReviewsSection from "@/components/ReviewsSection";
import type { Product as ProductType, Review as ReviewType } from "@/types";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

export const dynamic = "force-dynamic";

const getProduct = cache(async (identifier: string) => {
  await connectDB();
  const isId = /^[0-9a-f]{24}$/i.test(identifier);
  const product = await Product.findOne(
    isId ? { _id: identifier, active: true } : { slug: identifier, active: true }
  ).populate("category").lean();
  if (!product) return null;

  const reviews = await Review.find({ product: (product as unknown as { _id: string })._id, approved: true })
    .sort({ createdAt: -1 })
    .lean();

  return {
    product: JSON.parse(JSON.stringify(product)) as ProductType,
    reviews: JSON.parse(JSON.stringify(reviews)) as ReviewType[],
  };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  }

  const { product } = data;
  const description = product.description.replace(/\s+/g, " ").trim().slice(0, 160);
  const image = absoluteUrl(product.images?.find(Boolean) || "/logo.png");
  const url = absoluteUrl(`/product/${product.slug}`);

  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "D_ALLURE",
      title: product.name,
      description,
      url,
      images: [{ url: image, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) notFound();

  const { product, reviews } = data;
  const categoryName = typeof product.category === "object" ? product.category.name : "";
  const productImages = product.images?.filter(Boolean) || [];
  const galleryImages = productImages.length > 0 ? productImages : ["/logo.png"];
  const url = absoluteUrl(`/product/${product.slug}`);
  const price = product.discountPrice || product.price;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: galleryImages.map((image) => absoluteUrl(image)),
    description: product.description,
    sku: product._id,
    brand: { "@type": "Brand", name: "D_ALLURE" },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "NGN",
      price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-8 md:px-10 md:pb-28 md:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Link href="/shop" className="mb-7 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-beige-dim transition-colors hover:text-beige">
        <ArrowLeft size={13} /> Back to the collection
      </Link>
      <div className="grid items-start gap-9 md:grid-cols-[1.05fr_0.95fr] md:gap-14">
        <ProductGallery images={galleryImages} videos={product.videos} name={product.name} />

        <div className="md:sticky md:top-32">
          {categoryName && (
            <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-burgundy-bright">
              D_ALLURE / {categoryName}
            </p>
          )}
          <h1 className="mb-5 font-display text-4xl leading-tight text-beige md:text-5xl">{product.name}</h1>
          <div className="border-y border-line py-5">
            <ProductBuyBox product={product} />
          </div>
          <div className="mt-7">
            <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-beige">The details</p>
            <p className="whitespace-pre-line text-sm leading-7 text-beige-dim">{product.description}</p>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 border-t border-line pt-5">
            {[
              product.customizable ? "Personalize your bottle" : "Find your signature scent",
              "Track your order online",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-[10px] text-beige-dim">
                <Check size={13} className="shrink-0 text-burgundy-bright" />
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-16 border-t border-line pt-12 md:mt-24 md:pt-16">
        <ReviewsSection productId={product._id} initialReviews={reviews} />
      </div>
    </div>
  );
}
