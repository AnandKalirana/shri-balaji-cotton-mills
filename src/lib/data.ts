import type { Category, Product, Order, DashboardStats } from "./types";

export const categories: Category[] = [
  { id: "1", name: "Silk Sarees", slug: "silk-sarees", description: "Pure silk weaves from Varanasi and Kanchipuram", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800", productCount: 48 },
  { id: "2", name: "Banarasi Brocade", slug: "banarasi-brocade", description: "Exquisite zari brocade from the looms of Varanasi", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800", productCount: 32 },
  { id: "3", name: "Handloom Fabrics", slug: "handloom-fabrics", description: "Artisan handloom in cotton, linen and blended fibres", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", productCount: 64 },
  { id: "4", name: "Bridal Collection", slug: "bridal-collection", description: "Bespoke bridal couture and lehenga fabrics", image: "https://images.unsplash.com/photo-1519657831219-0571f74f3c3c?w=800", productCount: 24 },
  { id: "5", name: "Dress Materials", slug: "dress-materials", description: "Ready-to-stitch fabrics for salwar suits and kurtis", image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800", productCount: 56 },
  { id: "6", name: "Zari & Embroidery", slug: "zari-embroidery", description: "Embroidered panels, borders and zari work", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800", productCount: 18 },
];

export const products: Product[] = [
  {
    id: "p1", name: "Royal Maroon Banarasi Silk Saree", slug: "royal-maroon-banarasi-silk",
    category: "silk-sarees", department: "Silk Sarees", price: 18500, pricePerMetre: 3700,
    images: [
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
    ],
    description: "A masterpiece of Banarasi craftsmanship. Woven with pure Katan silk and real zari, this saree features intricate floral buti motifs across the body and a dramatic pallav with architectural temple borders.",
    fabricType: "Banarasi Silk", composition: "100% Pure Katan Silk with Real Zari",
    width: "46 inches", care: "Dry clean only", inStock: true, stockQty: 8,
    tags: ["silk", "banarasi", "zari", "bridal"], badge: "Bestseller",
  },
  {
    id: "p2", name: "Champagne Gold Tissue Silk", slug: "champagne-gold-tissue-silk",
    category: "silk-sarees", department: "Silk Sarees", price: 24000, pricePerMetre: 4800,
    images: [
      "https://images.unsplash.com/photo-1519657831219-0571f74f3c3c?w=800",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    ],
    description: "Luminous tissue silk saree with a warm champagne gold base. The transparent weave creates a gossamer-light drape perfect for evening occasions and reception wear.",
    fabricType: "Tissue Silk", composition: "80% Silk, 20% Zari",
    width: "44 inches", care: "Dry clean only", inStock: true, stockQty: 4,
    tags: ["tissue", "silk", "gold", "reception"], badge: "New",
  },
  {
    id: "p3", name: "Ivory Handloom Cotton Fabric", slug: "ivory-handloom-cotton",
    category: "handloom-fabrics", department: "Handloom Fabrics", price: 1200, pricePerMetre: 240,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    ],
    description: "Breathable, naturally woven cotton handloom fabric from Bengal. Perfect for everyday kurtas and summer salwars.",
    fabricType: "Handloom Cotton", composition: "100% Cotton",
    width: "44 inches", care: "Machine wash cold", inStock: true, stockQty: 125,
    tags: ["cotton", "handloom", "bengal", "everyday"],
  },
  {
    id: "p4", name: "Deep Burgundy Brocade Panel", slug: "deep-burgundy-brocade-panel",
    category: "banarasi-brocade", department: "Banarasi Brocade", price: 6800, pricePerMetre: 1360,
    images: [
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800",
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800",
    ],
    description: "Rich burgundy brocade with intricate gold meenakari work. Ideal for blouses, jacket panels and lehenga borders.",
    fabricType: "Brocade", composition: "Silk warp with Zari weft",
    width: "44 inches", care: "Dry clean", inStock: true, stockQty: 22,
    tags: ["brocade", "burgundy", "blouse piece", "meenakari"],
  },
  {
    id: "p5", name: "Emerald Raw Silk Yardage", slug: "emerald-raw-silk-yardage",
    category: "handloom-fabrics", department: "Handloom Fabrics", price: 2800, pricePerMetre: 560,
    images: [
      "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800",
    ],
    description: "Lustrous raw silk in a rich emerald green. Its natural slub texture gives each metre a unique character.",
    fabricType: "Raw Silk", composition: "100% Raw Silk",
    width: "44 inches", care: "Dry clean recommended", inStock: true, stockQty: 38,
    tags: ["raw silk", "green", "dupioni"],
  },
  {
    id: "p6", name: "Ivory Bridal Lehenga Fabric Set", slug: "ivory-bridal-lehenga-set",
    category: "bridal-collection", department: "Bridal Collection", price: 42000,
    images: [
      "https://images.unsplash.com/photo-1519657831219-0571f74f3c3c?w=800",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
    ],
    description: "Complete bridal fabric set in ivory with gold embroidery. Includes lehenga panel (5m), blouse fabric (1m), and dupatta.",
    fabricType: "Embroidered Silk", composition: "Silk base with zari and sequin embroidery",
    care: "Professional dry clean only", inStock: true, stockQty: 6,
    tags: ["bridal", "lehenga", "ivory", "embroidered", "set"], badge: "Limited",
  },
  {
    id: "p7", name: "Navy Kantha Stitch Cotton", slug: "navy-kantha-stitch-cotton",
    category: "handloom-fabrics", department: "Handloom Fabrics", price: 1800, pricePerMetre: 360,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    ],
    description: "Traditional Kantha stitch running thread embroidery on soft cotton. Artisanal and slow-fashion.",
    fabricType: "Kantha Cotton", composition: "100% Cotton with Kantha embroidery",
    width: "44 inches", care: "Hand wash cold", inStock: true, stockQty: 15,
    tags: ["kantha", "cotton", "embroidery", "artisan"],
  },
  {
    id: "p8", name: "Gold Zari Border Dupatta", slug: "gold-zari-border-dupatta",
    category: "zari-embroidery", department: "Zari & Embroidery", price: 3200,
    images: [
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800",
    ],
    description: "Sheer organza dupatta with a broad gold zari border and delicate scattered butti motifs.",
    fabricType: "Organza with Zari", composition: "Organza with real gold zari border",
    care: "Dry clean only", inStock: false, stockQty: 0,
    tags: ["dupatta", "zari", "organza", "gold"],
  },
];

export const orders: Order[] = [
  {
    id: "o1", orderNumber: "HA-2026-00128",
    customer: { name: "Priya Sharma", email: "priya@email.com", phone: "+91 98765 43210" },
    items: [{ product: products[0], quantity: 1 }],
    total: 18500, status: "confirmed",
    createdAt: "2026-11-01T08:30:00Z",
    shippingAddress: { street: "42, Lajpat Nagar II", city: "New Delhi", state: "Delhi", pincode: "110024" },
  },
  {
    id: "o2", orderNumber: "HA-2026-00127",
    customer: { name: "Meena Rao", email: "meena@email.com", phone: "+91 87654 32109" },
    items: [{ product: products[2], quantity: 3, metres: 3 }, { product: products[4], quantity: 2, metres: 2 }],
    total: 9200, status: "shipped",
    createdAt: "2026-10-31T14:15:00Z",
    shippingAddress: { street: "15, MG Road", city: "Bangalore", state: "Karnataka", pincode: "560001" },
  },
  {
    id: "o3", orderNumber: "HA-2026-00126",
    customer: { name: "Anjali Verma", email: "anjali@email.com", phone: "+91 76543 21098" },
    items: [{ product: products[5], quantity: 1 }],
    total: 42000, status: "processing",
    createdAt: "2026-10-31T10:00:00Z",
    shippingAddress: { street: "8, Park Street", city: "Kolkata", state: "West Bengal", pincode: "700016" },
  },
  {
    id: "o4", orderNumber: "HA-2026-00125",
    customer: { name: "Sunita Patel", email: "sunita@email.com", phone: "+91 65432 10987" },
    items: [{ product: products[3], quantity: 1, metres: 2 }],
    total: 13600, status: "delivered",
    createdAt: "2026-10-29T16:20:00Z",
    shippingAddress: { street: "22, CG Road", city: "Ahmedabad", state: "Gujarat", pincode: "380006" },
  },
  {
    id: "o5", orderNumber: "HA-2026-00124",
    customer: { name: "Kavya Nair", email: "kavya@email.com", phone: "+91 54321 09876" },
    items: [{ product: products[1], quantity: 1 }],
    total: 24000, status: "pending",
    createdAt: "2026-11-01T12:45:00Z",
    shippingAddress: { street: "7, Marine Drive", city: "Kochi", state: "Kerala", pincode: "682031" },
  },
];

export const dashboardStats: DashboardStats = {
  totalRevenue: 12_48_500,
  totalOrders: 128,
  totalProducts: 242,
  lowStockItems: 11,
  revenueChange: 14.2,
  ordersChange: 8.7,
};

