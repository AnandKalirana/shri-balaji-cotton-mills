export type DeviceType = "mobile" | "tablet" | "desktop";

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  department: string;
  price: number;
  pricePerMetre?: number;
  images: string[];
  description: string;
  fabricType: string;
  composition: string;
  width?: string;
  care?: string;
  inStock: boolean;
  stockQty: number;
  tags: string[];
  badge?: string;
  /** false when the owner has hidden the product from the store. */
  isActive?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  metres?: number;
  isFullThaan?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: CartItem[];
  total: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockItems: number;
  revenueChange: number;
  ordersChange: number;
}
