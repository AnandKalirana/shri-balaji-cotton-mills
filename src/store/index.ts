"use client";
import { create } from "zustand";
import type { CartItem, Product } from "@/lib/types";

/** One bag line is one product in one size and colour. */
export const cartLineKey = (i: Pick<CartItem, "product" | "variantId">) => `${i.product.id}:${i.variantId ?? ""}`;

export interface CartVariantChoice {
  variantId: string;
  size?: string;
  colour?: string;
  image?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number, metres?: number, choice?: CartVariantChoice) => void;
  removeItem: (lineKey: string) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (product, quantity = 1, metres, choice) => {
    const key = cartLineKey({ product, variantId: choice?.variantId });
    set((state) => {
      const existing = state.items.find((i) => cartLineKey(i) === key);
      if (existing) {
        return {
          items: state.items.map((i) => (cartLineKey(i) === key ? { ...i, quantity: i.quantity + quantity } : i)),
        };
      }
      return { items: [...state.items, { product, quantity, metres, ...choice }] };
    });
  },

  removeItem: (lineKey) => {
    set((state) => ({ items: state.items.filter((i) => cartLineKey(i) !== lineKey) }));
  },

  updateQuantity: (lineKey, quantity) => {
    if (quantity <= 0) {
      get().removeItem(lineKey);
      return;
    }
    set((state) => ({
      items: state.items.map((i) => (cartLineKey(i) === lineKey ? { ...i, quantity } : i)),
    }));
  },

  clearCart: () => set({ items: [] }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  total: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));

interface UIStore {
  mobileMenuOpen: boolean;
  adminSidebarOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleAdminSidebar: () => void;
  closeAdminSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  mobileMenuOpen: false,
  adminSidebarOpen: false,
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  toggleAdminSidebar: () => set((s) => ({ adminSidebarOpen: !s.adminSidebarOpen })),
  closeAdminSidebar: () => set({ adminSidebarOpen: false }),
}));

