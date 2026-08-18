import { Schema, models, model, Types } from "mongoose";

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: Types.ObjectId;
  price: number;
  discountPrice?: number;
  discountPercent?: number;
  images: string[];
  videos: string[];
  customizable: boolean;
  stock: number;
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    discountPercent: { type: Number },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    customizable: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Product || model<IProduct>("Product", ProductSchema);
