export type DeviceType = "mobile" | "tablet" | "desktop";

export interface ProductVariantOption {
  id: string;
  sku: string;
  size: string;
  colour: string;
  stockQty: number;
}

export interface ProductColour {
  name: string;
  hex: string;
  /** Photos for this colour. Empty means use the product's main photos. */
  images: string[];
}

/** Sizes and colours a shopper can choose. Only present when the product has some. */
export interface ProductOptions {
  sizes: string[];
  colours: ProductColour[];
  variants: ProductVariantOption[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  department: string;
  price: number;
  /** Original price, shown crossed out when the selling price is lower. */
  mrp?: number;
  pricePerMetre?: number;
  images: string[];
  options?: ProductOptions;
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
  /** Which size and colour was chosen, for products that have them. */
  variantId?: string;
  size?: string;
  colour?: string;
  /** Photo of the chosen colour, shown in the bag. */
  image?: string;
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
