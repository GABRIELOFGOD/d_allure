import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import Category from "../src/models/Category";
import Product from "../src/models/Product";
import { slugify } from "../src/lib/utils";

const PRICE_NAIRA = 15_000;
const STARTING_STOCK = 10;
const ASSET_DIRECTORY = path.join(process.cwd(), "public", "test-catalog");
const PUBLIC_ASSET_DIRECTORY = "/test-catalog";

const categories = [
  { name: "Floral & Rose", slug: "floral-rose", description: "Floral and rose fragrance references for catalog testing." },
  { name: "Fruity & Gourmand", slug: "fruity-gourmand", description: "Fruity and gourmand fragrance references for catalog testing." },
  { name: "Amber, Oud & Spice", slug: "amber-oud-spice", description: "Amber, oud and spicy fragrance references for catalog testing." },
  { name: "Woods & Leather", slug: "woods-leather", description: "Woody and leather fragrance references for catalog testing." },
  { name: "Fresh, Citrus & Green", slug: "fresh-citrus-green", description: "Fresh, citrus and green fragrance references for catalog testing." },
  { name: "Distinctive Signatures", slug: "distinctive-signatures", description: "Distinctive fragrance references for catalog testing." },
] as const;

type CategorySlug = (typeof categories)[number]["slug"];

const officialSources = {
  tomFord: "https://www.tomfordbeauty.com/",
  kayali: "https://kayali.com/",
  diptyque: "https://us.diptyqueparis.com/en-us/pages/fragrances",
  joMalone: "https://www.jomalone.com/colognes",
} as const;

const catalog: { name: string; category: CategorySlug; source: keyof typeof officialSources }[] = [
  { name: "KAYALI Déjà Vu White Flower | 57", category: "floral-rose", source: "kayali" },
  { name: "KAYALI Sweet Diamond Pink Pepper | 25", category: "floral-rose", source: "kayali" },
  { name: "TOM FORD Rose Prick Eau de Parfum", category: "floral-rose", source: "tomFord" },
  { name: "TOM FORD Café Rose Eau de Parfum", category: "floral-rose", source: "tomFord" },
  { name: "TOM FORD Jasmin Rouge Eau de Parfum", category: "floral-rose", source: "tomFord" },
  { name: "Diptyque Eau Rose Eau de Parfum", category: "floral-rose", source: "diptyque" },
  { name: "Diptyque Do Son Eau de Parfum", category: "floral-rose", source: "diptyque" },
  { name: "Diptyque Fleur de Peau Eau de Parfum", category: "floral-rose", source: "diptyque" },
  { name: "Jo Malone London Red Roses Cologne", category: "floral-rose", source: "joMalone" },
  { name: "Jo Malone London Peony & Blush Suede Cologne", category: "floral-rose", source: "joMalone" },

  { name: "TOM FORD Lost Cherry Eau de Parfum", category: "fruity-gourmand", source: "tomFord" },
  { name: "TOM FORD Bitter Peach Eau de Parfum", category: "fruity-gourmand", source: "tomFord" },
  { name: "TOM FORD Vanilla Sex Eau de Parfum", category: "fruity-gourmand", source: "tomFord" },
  { name: "KAYALI Vanilla | 28", category: "fruity-gourmand", source: "kayali" },
  { name: "KAYALI Eden Juicy Apple | 01", category: "fruity-gourmand", source: "kayali" },
  { name: "KAYALI Yum Pistachio Gelato | 33", category: "fruity-gourmand", source: "kayali" },
  { name: "KAYALI Yum Boujee Marshmallow | 81", category: "fruity-gourmand", source: "kayali" },
  { name: "Jo Malone London English Pear & Freesia Cologne", category: "fruity-gourmand", source: "joMalone" },
  { name: "Jo Malone London Nectarine Blossom & Honey Cologne", category: "fruity-gourmand", source: "joMalone" },
  { name: "Jo Malone London Pomegranate Noir Cologne", category: "fruity-gourmand", source: "joMalone" },

  { name: "TOM FORD Tobacco Vanille Eau de Parfum", category: "amber-oud-spice", source: "tomFord" },
  { name: "TOM FORD Oud Wood Eau de Parfum", category: "amber-oud-spice", source: "tomFord" },
  { name: "TOM FORD Noir de Noir Eau de Parfum", category: "amber-oud-spice", source: "tomFord" },
  { name: "TOM FORD Ébène Fumé Eau de Parfum", category: "amber-oud-spice", source: "tomFord" },
  { name: "TOM FORD Black Orchid Eau de Parfum", category: "amber-oud-spice", source: "tomFord" },
  { name: "KAYALI Invite Only Amber | 23", category: "amber-oud-spice", source: "kayali" },
  { name: "KAYALI Oudgasm Rose Oud | 16", category: "amber-oud-spice", source: "kayali" },
  { name: "KAYALI Oudgasm Vanilla Oud | 36", category: "amber-oud-spice", source: "kayali" },
  { name: "Diptyque Eau Duelle Eau de Parfum", category: "amber-oud-spice", source: "diptyque" },
  { name: "Jo Malone London Myrrh & Tonka Cologne Intense", category: "amber-oud-spice", source: "joMalone" },

  { name: "TOM FORD Ombré Leather Eau de Parfum", category: "woods-leather", source: "tomFord" },
  { name: "TOM FORD Fucking Fabulous Eau de Parfum", category: "woods-leather", source: "tomFord" },
  { name: "TOM FORD Santal Blush Eau de Parfum", category: "woods-leather", source: "tomFord" },
  { name: "TOM FORD Noir Extreme Eau de Parfum", category: "woods-leather", source: "tomFord" },
  { name: "TOM FORD Grey Vetiver Eau de Parfum", category: "woods-leather", source: "tomFord" },
  { name: "KAYALI Freedom Musk Santal | 34", category: "woods-leather", source: "kayali" },
  { name: "Diptyque Tam Dao Eau de Parfum", category: "woods-leather", source: "diptyque" },
  { name: "Diptyque Philosykos Eau de Toilette", category: "woods-leather", source: "diptyque" },
  { name: "Diptyque Vetyverio Eau de Parfum", category: "woods-leather", source: "diptyque" },
  { name: "Jo Malone London English Oak & Hazelnut Cologne", category: "woods-leather", source: "joMalone" },

  { name: "TOM FORD Neroli Portofino Eau de Parfum", category: "fresh-citrus-green", source: "tomFord" },
  { name: "TOM FORD Costa Azzurra Eau de Parfum", category: "fresh-citrus-green", source: "tomFord" },
  { name: "TOM FORD Oud Minérale Eau de Parfum", category: "fresh-citrus-green", source: "tomFord" },
  { name: "TOM FORD Soleil Blanc Eau de Parfum", category: "fresh-citrus-green", source: "tomFord" },
  { name: "TOM FORD Soleil Neige Eau de Parfum", category: "fresh-citrus-green", source: "tomFord" },
  { name: "KAYALI Musk | 12", category: "fresh-citrus-green", source: "kayali" },
  { name: "Diptyque Eau des Sens Eau de Toilette", category: "fresh-citrus-green", source: "diptyque" },
  { name: "Diptyque Oyédo Eau de Toilette", category: "fresh-citrus-green", source: "diptyque" },
  { name: "Diptyque L’Eau Papier Eau de Toilette", category: "fresh-citrus-green", source: "diptyque" },
  { name: "Jo Malone London Wood Sage & Sea Salt Cologne", category: "fresh-citrus-green", source: "joMalone" },

  { name: "TOM FORD Electric Cherry Eau de Parfum", category: "distinctive-signatures", source: "tomFord" },
  { name: "TOM FORD White Suede Eau de Parfum", category: "distinctive-signatures", source: "tomFord" },
  { name: "KAYALI Lovefest Burning Cherry | 48", category: "distinctive-signatures", source: "kayali" },
  { name: "KAYALI Utopia Vanilla Coco | 21", category: "distinctive-signatures", source: "kayali" },
  { name: "Diptyque Orphéon Eau de Parfum", category: "distinctive-signatures", source: "diptyque" },
  { name: "Diptyque L’Ombre dans l’Eau Eau de Parfum", category: "distinctive-signatures", source: "diptyque" },
  { name: "Diptyque 34 Boulevard Saint Germain Eau de Toilette", category: "distinctive-signatures", source: "diptyque" },
  { name: "Jo Malone London Lime Basil & Mandarin Cologne", category: "distinctive-signatures", source: "joMalone" },
  { name: "Jo Malone London Blackberry & Bay Cologne", category: "distinctive-signatures", source: "joMalone" },
  { name: "Jo Malone London Wild Bluebell Cologne", category: "distinctive-signatures", source: "joMalone" },
];

const palette = ["#6f1830", "#9c1836", "#8b6a47", "#c3a77c", "#48262d", "#b57a68"];

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

function wrapText(value: string, maxLength: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of value.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function createProductArtwork(name: string, categoryName: string, index: number) {
  const accent = palette[index % palette.length];
  const lines = wrapText(name, 22);
  const bottleWidth = 250 + (index % 4) * 12;
  const bottleX = (640 - bottleWidth) / 2;
  const labelLines = lines
    .map((line, lineIndex) => `<text x="320" y="${475 + lineIndex * 25}" text-anchor="middle" fill="#2b1917" font-size="16" letter-spacing="0.6">${escapeXml(line)}</text>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="800" viewBox="0 0 640 800">
<defs>
  <radialGradient id="glow"><stop stop-color="${accent}" stop-opacity=".5"/><stop offset="1" stop-color="#0b0807" stop-opacity="0"/></radialGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${accent}" stop-opacity=".9"/><stop offset=".48" stop-color="#1e1512" stop-opacity=".8"/><stop offset="1" stop-color="#efe6d8" stop-opacity=".18"/></linearGradient>
  <linearGradient id="cap" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#efe6d8"/><stop offset=".5" stop-color="#9b7857"/><stop offset="1" stop-color="#efe6d8"/></linearGradient>
</defs>
<rect width="640" height="800" fill="#100b0a"/>
<circle cx="${300 + (index % 5) * 10}" cy="350" r="300" fill="url(#glow)"/>
<path d="M80 690h480" stroke="#efe6d8" stroke-opacity=".16"/>
<text x="320" y="95" text-anchor="middle" fill="#efe6d8" font-family="Georgia,serif" font-size="20" letter-spacing="8">D_ALLURE</text>
<text x="320" y="126" text-anchor="middle" fill="#b6a891" font-family="monospace" font-size="10" letter-spacing="3">TEST CATALOG · ${escapeXml(categoryName.toUpperCase())}</text>
<ellipse cx="320" cy="674" rx="162" ry="20" fill="#000" opacity=".55"/>
<rect x="257" y="190" width="126" height="55" rx="${8 + (index % 3) * 4}" fill="url(#cap)" opacity=".95"/>
<path d="M272 242h96v42h-96z" fill="#694a3c" stroke="#c3a77c" stroke-opacity=".5"/>
<rect x="${bottleX}" y="270" width="${bottleWidth}" height="390" rx="${36 + (index % 4) * 7}" fill="url(#glass)" stroke="#efe6d8" stroke-opacity=".5" stroke-width="2"/>
<path d="M${bottleX + 31} 306v302" stroke="#fff" stroke-opacity=".23" stroke-width="10" stroke-linecap="round"/>
<rect x="${bottleX + 20}" y="423" width="${bottleWidth - 40}" height="144" rx="4" fill="#efe6d8" opacity=".94"/>
<text x="320" y="451" text-anchor="middle" fill="#6f1830" font-family="monospace" font-size="9" letter-spacing="2">SIGNATURE OIL</text>
${labelLines}
<text x="320" y="548" text-anchor="middle" fill="#694a3c" font-family="monospace" font-size="8" letter-spacing="2">SAMPLE · NOT FOR RETAIL</text>
<text x="320" y="742" text-anchor="middle" fill="#b6a891" font-family="monospace" font-size="10" letter-spacing="3">A TESTING IMAGE · D_ALLURE</text>
</svg>`;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (catalog.length !== 60) throw new Error(`Expected 60 catalog entries, found ${catalog.length}`);

  await mongoose.connect(uri);
  try {
    await mkdir(ASSET_DIRECTORY, { recursive: true });

    const categoryIds = new Map<CategorySlug, mongoose.Types.ObjectId>();
    for (const category of categories) {
      const firstProduct = catalog.find((item) => item.category === category.slug);
      if (!firstProduct) throw new Error(`No products configured for ${category.name}`);

      const categoryImageSlug = `test-${slugify(firstProduct.name)}`;
      const savedCategory = await Category.findOneAndUpdate(
        { slug: category.slug },
        {
          $setOnInsert: {
            ...category,
            image: `${PUBLIC_ASSET_DIRECTORY}/${categoryImageSlug}.svg`,
          },
        },
        { returnDocument: "after", upsert: true }
      );
      categoryIds.set(category.slug, savedCategory._id);
    }

    const operations = await Promise.all(
      catalog.map(async (item, index) => {
        const slug = `test-${slugify(item.name)}`;
        const imagePath = `${PUBLIC_ASSET_DIRECTORY}/${slug}.svg`;
        const category = categories.find((entry) => entry.slug === item.category);
        const categoryId = categoryIds.get(item.category);
        if (!category || !categoryId) throw new Error(`Missing category for ${item.name}`);

        await writeFile(
          path.join(ASSET_DIRECTORY, `${slug}.svg`),
          createProductArtwork(item.name, category.name, index),
          "utf8"
        );

        return {
          updateOne: {
            filter: { slug },
            update: {
              $setOnInsert: {
                name: `TEST — ${item.name}`,
                slug,
                description: "Test catalog listing. Replace this with D_ALLURE's verified scent notes and product details before launch.",
                category: categoryId,
                price: PRICE_NAIRA,
                images: [imagePath],
                videos: [],
                customizable: true,
                stock: STARTING_STOCK,
                featured: index < 8,
                active: true,
              },
            },
            upsert: true,
          },
        };
      })
    );

    const result = await Product.bulkWrite(operations, { ordered: true });
    console.log(
      `Test catalog ready: ${result.upsertedCount} products added, ${result.matchedCount} existing entries kept, ${categories.length} categories.`
    );
    console.log(`Demo price: ₦${PRICE_NAIRA.toLocaleString("en-NG")}; starting stock: ${STARTING_STOCK} each.`);
    console.log("Product images are original local SVG test artwork; product names are sourced from official brand catalogs.");
    console.log(`Official sources: ${Object.values(officialSources).join(", ")}`);
    console.log("Replace test product names, descriptions, prices, stock, and images before launch.");
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Could not seed the test catalog:", error);
  process.exitCode = 1;
});
