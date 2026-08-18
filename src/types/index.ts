export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: Category | string;
  price: number;
  discountPrice?: number;
  discountPercent?: number;
  images: string[];
  videos: string[];
  customizable: boolean;
  stock: number;
  featured: boolean;
  active: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  customName?: string;
  customizable: boolean;
}

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  customName?: string;
}

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

export interface Order {
  _id: string;
  trackingId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  total: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    note?: string;
  };
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  _id: string;
  text: string;
  active: boolean;
}

export interface Coupon {
  _id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  active: boolean;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  orderCount: number;
  totalSpent: number;
  subscribed: boolean;
  createdAt: string;
}

export interface Review {
  _id: string;
  product: string;
  order: string;
  trackingId: string;
  name: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}
