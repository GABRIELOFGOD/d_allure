import { Schema, models, model } from "mongoose";

export interface ICoupon {
  _id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  active: boolean;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: Date;
  createdAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true },
    active: { type: Boolean, default: true },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export default models.Coupon || model<ICoupon>("Coupon", CouponSchema);
