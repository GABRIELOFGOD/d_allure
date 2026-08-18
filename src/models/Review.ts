import { Schema, models, model, Types } from "mongoose";

export interface IReview {
  _id: string;
  product: Types.ObjectId;
  order: Types.ObjectId;
  trackingId: string;
  name: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    trackingId: { type: String, required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One review per order per product
ReviewSchema.index({ product: 1, order: 1 }, { unique: true });

export default models.Review || model<IReview>("Review", ReviewSchema);
