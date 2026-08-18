import { Schema, models, model, Types } from "mongoose";

export interface ICustomer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  orderCount: number;
  orderIds: Types.ObjectId[];
  totalSpent: number;
  subscribed: boolean;
  createdAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    orderCount: { type: Number, default: 0 },
    orderIds: { type: [Schema.Types.ObjectId], ref: "Order", default: [] },
    totalSpent: { type: Number, default: 0 },
    subscribed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Customer || model<ICustomer>("Customer", CustomerSchema);
