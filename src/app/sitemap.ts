import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();
  const products = await Product.find({ active: true }).select("slug updatedAt").lean();

  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/shop"), changeFrequency: "daily", priority: 0.9 },
    ...products.map((product) => ({
      url: absoluteUrl(`/product/${product.slug}`),
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
