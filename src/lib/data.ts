import type { Category, Product, Order, DashboardStats } from "./types";

export const categories: Category[] = [
  { id: "1", name: "Fabrics", slug: "fabrics", description: "Cotton, silk and blended fabrics sold by the metre", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", productCount: 0 },
  { id: "2", name: "Kurta Set", slug: "kurta-set", description: "Ready-to-wear kurta sets with bottoms and dupatta", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800", productCount: 0 },
  { id: "3", name: "Kurti", slug: "kurti", description: "Everyday and festive kurtis in soft, comfortable cottons", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800", productCount: 0 },
  { id: "4", name: "Stretchy Blouse", slug: "stretchy-blouse", description: "Ready-made stretchy saree blouses that fit comfortably", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800", productCount: 0 },
  { id: "5", name: "Saree Shapewear", slug: "saree-shapewear", description: "Saree shapewear and petticoats for a smooth, secure drape", image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800", productCount: 0 },
  { id: "6", name: "Men's Wear", slug: "mens-wear", description: "Men's T-shirts and shirts in soft, comfortable cotton", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800", productCount: 0 },
];

export const products: Product[] = [
  {
    id: "p1", name: "Maroon Cotton Silk Kurta Set", slug: "maroon-cotton-silk-kurta-set",
    category: "kurta-set", department: "Kurta Set", price: 18500, pricePerMetre: 3700,
    images: [
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
    ],
    description: "Kurta, straight pants and dupatta in a soft cotton silk with a rich maroon finish and fine woven buti. Easy to wear for festive days and family functions.",
    fabricType: "Cotton Silk", composition: "Cotton silk blend",
    width: "46 inches", care: "Dry clean only", inStock: true, stockQty: 8,
    tags: ["kurta set", "cotton silk", "maroon", "festive"], badge: "Bestseller",
  },
  {
    id: "p2", name: "Champagne Gold Tissue Silk Fabric", slug: "champagne-gold-tissue-silk",
    category: "fabrics", department: "Fabrics", price: 24000, pricePerMetre: 4800,
    images: [
      "https://images.unsplash.com/photo-1519657831219-0571f74f3c3c?w=800",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    ],
    description: "Luminous tissue silk fabric with a warm champagne gold base. The sheer weave drapes lightly and suits blouses, dupattas and evening wear.",
    fabricType: "Tissue Silk", composition: "80% Silk, 20% Zari",
    width: "44 inches", care: "Dry clean only", inStock: true, stockQty: 4,
    tags: ["tissue", "silk", "gold", "reception"], badge: "New",
  },
  {
    id: "p3", name: "Ivory Handloom Cotton Fabric", slug: "ivory-handloom-cotton",
    category: "fabrics", department: "Fabrics", price: 1200, pricePerMetre: 240,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    ],
    description: "Breathable, naturally woven cotton handloom fabric from Bengal. Perfect for everyday kurtas and summer salwars.",
    fabricType: "Handloom Cotton", composition: "100% Cotton",
    width: "44 inches", care: "Machine wash cold", inStock: true, stockQty: 125,
    tags: ["cotton", "handloom", "bengal", "everyday"],
  },
  {
    id: "p4", name: "Deep Burgundy Brocade Fabric", slug: "deep-burgundy-brocade-panel",
    category: "fabrics", department: "Fabrics", price: 6800, pricePerMetre: 1360,
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
    id: "p5", name: "Emerald Raw Silk Fabric", slug: "emerald-raw-silk-yardage",
    category: "fabrics", department: "Fabrics", price: 2800, pricePerMetre: 560,
    images: [
      "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800",
    ],
    description: "Lustrous raw silk in a rich emerald green. Its natural slub texture gives each metre a unique character.",
    fabricType: "Raw Silk", composition: "100% Raw Silk",
    width: "44 inches", care: "Dry clean recommended", inStock: true, stockQty: 38,
    tags: ["raw silk", "green", "dupioni"],
  },
  {
    id: "p6", name: "Ivory Chikankari Kurta Set", slug: "ivory-chikankari-kurta-set",
    category: "kurta-set", department: "Kurta Set", price: 42000,
    images: [
      "https://images.unsplash.com/photo-1519657831219-0571f74f3c3c?w=800",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
    ],
    description: "Three-piece ivory kurta set with gold embroidery. Includes kurta, pants and dupatta.",
    fabricType: "Embroidered Cotton", composition: "Cotton with thread embroidery",
    care: "Professional dry clean only", inStock: true, stockQty: 6,
    tags: ["kurta set", "ivory", "embroidered", "set"], badge: "Limited",
  },
  {
    id: "p7", name: "Navy Kantha Cotton Kurti", slug: "navy-kantha-cotton-kurti",
    category: "kurti", department: "Kurti", price: 1800, pricePerMetre: 360,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    ],
    description: "Soft cotton kurti with traditional Kantha running-stitch embroidery. Light, breathable and easy to style every day.",
    fabricType: "Kantha Cotton", composition: "100% Cotton with Kantha embroidery",
    width: "44 inches", care: "Hand wash cold", inStock: true, stockQty: 15,
    tags: ["kurti", "kantha", "cotton", "everyday"],
  },
  {
    id: "p8", name: "Gold Border Stretchy Saree Blouse", slug: "gold-border-stretchy-blouse",
    category: "stretchy-blouse", department: "Stretchy Blouse", price: 3200,
    images: [
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800",
    ],
    description: "Ready-made stretchy blouse with a gold border on the sleeves and neckline. Fits comfortably and goes with most sarees.",
    fabricType: "Stretch Lycra Blend", composition: "Cotton lycra blend with gold border trim",
    care: "Hand wash cold", inStock: true, stockQty: 25,
    tags: ["blouse", "stretchy", "gold", "ready-made"],
  },
  {
    id: "p9", name: "Nude Saree Shapewear", slug: "nude-saree-shapewear",
    category: "saree-shapewear", department: "Saree Shapewear", price: 899,
    images: [
      "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800",
    ],
    description: "High-waist saree shapewear in a stretchy, breathable fabric. Smooths the silhouette, keeps the saree pleats in place and stays comfortable all day.",
    fabricType: "Stretch Nylon Blend", composition: "Nylon and spandex blend",
    care: "Hand wash cold", inStock: true, stockQty: 40,
    tags: ["shapewear", "saree", "stretchy", "nude"], badge: "New",
  },
  {
    id: "p10", name: "Men's Cotton Round Neck T-Shirt", slug: "mens-cotton-round-neck-tshirt",
    category: "mens-wear", department: "Men's Wear", price: 499,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    ],
    description: "Soft combed-cotton round neck T-shirt with a regular fit. Breathable, easy to wash and made for daily wear.",
    fabricType: "Combed Cotton", composition: "100% Cotton",
    care: "Machine wash cold", inStock: true, stockQty: 60,
    tags: ["mens", "tshirt", "t-shirt", "cotton"], badge: "New",
  },
  {
    id: "p11", name: "Men's Cotton Casual Shirt", slug: "mens-cotton-casual-shirt",
    category: "mens-wear", department: "Men's Wear", price: 899,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
    ],
    description: "Full-sleeve casual shirt in breathable cotton with a classic collar and comfortable regular fit. Works for office and weekends.",
    fabricType: "Cotton Poplin", composition: "100% Cotton",
    care: "Machine wash cold", inStock: true, stockQty: 45,
    tags: ["mens", "shirt", "casual", "cotton"],
  },
];

export const orders: Order[] = [
  {
    id: "o1", orderNumber: "SB-2026-00128",
    customer: { name: "Priya Sharma", email: "priya@email.com", phone: "+91 98765 43210" },
    items: [{ product: products[0], quantity: 1 }],
    total: 18500, status: "confirmed",
    createdAt: "2026-11-01T08:30:00Z",
    shippingAddress: { street: "42, Lajpat Nagar II", city: "New Delhi", state: "Delhi", pincode: "110024" },
  },
  {
    id: "o2", orderNumber: "SB-2026-00127",
    customer: { name: "Meena Rao", email: "meena@email.com", phone: "+91 87654 32109" },
    items: [{ product: products[2], quantity: 3, metres: 3 }, { product: products[4], quantity: 2, metres: 2 }],
    total: 9200, status: "shipped",
    createdAt: "2026-10-31T14:15:00Z",
    shippingAddress: { street: "15, MG Road", city: "Bangalore", state: "Karnataka", pincode: "560001" },
  },
  {
    id: "o3", orderNumber: "SB-2026-00126",
    customer: { name: "Anjali Verma", email: "anjali@email.com", phone: "+91 76543 21098" },
    items: [{ product: products[5], quantity: 1 }],
    total: 42000, status: "processing",
    createdAt: "2026-10-31T10:00:00Z",
    shippingAddress: { street: "8, Park Street", city: "Kolkata", state: "West Bengal", pincode: "700016" },
  },
  {
    id: "o4", orderNumber: "SB-2026-00125",
    customer: { name: "Sunita Patel", email: "sunita@email.com", phone: "+91 65432 10987" },
    items: [{ product: products[3], quantity: 1, metres: 2 }],
    total: 13600, status: "delivered",
    createdAt: "2026-10-29T16:20:00Z",
    shippingAddress: { street: "22, CG Road", city: "Ahmedabad", state: "Gujarat", pincode: "380006" },
  },
  {
    id: "o5", orderNumber: "SB-2026-00124",
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

