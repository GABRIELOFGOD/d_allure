import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import Product from "../src/models/Product";

loadEnvConfig(process.cwd());

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  await mongoose.connect(uri);
  try {
    const indexes = await Product.collection.indexes();
    const slugIndexes = indexes.filter((index) => "slug" in index.key);
    for (const index of slugIndexes) {
      if (!index.name) throw new Error("Cannot remove an unnamed product slug index");
      await Product.collection.dropIndex(index.name);
    }

    const result = await Product.collection.updateMany({}, { $unset: { slug: "" } });
    console.log(`Removed ${slugIndexes.length} product slug index(es) and cleared slug from ${result.modifiedCount} product(s).`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Could not migrate products to ID-based URLs:", error);
  process.exitCode = 1;
});
