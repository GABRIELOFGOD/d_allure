import { Schema, models, model } from "mongoose";

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface IOrderItem {
  product: Schema.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
  customName?: string;
}

export interface IOrder {
  _id: string;
  trackingId: string;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentStatus: PaymentStatus;
  paidAt?: Date;
  refundedAt?: Date;
  inventoryReserved: boolean;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    note?: string;
  };
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    customName: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    trackingId: { type: String, required: true, unique: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    total: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid", required: true },
    paidAt: { type: Date },
    refundedAt: { type: Date },
    inventoryReserved: { type: Boolean, default: false, required: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      note: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default models.Order || model<IOrder>("Order", OrderSchema);
