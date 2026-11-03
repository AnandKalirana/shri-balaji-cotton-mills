/** Default homepage hero copy, used until a banner is saved in the CMS. */
export const DEFAULT_HERO = {
  eyebrow: "Shri Balaji Cotton Mills",
  title: "Ancient Weaves.\nArchitectural Luxury.",
  subtitle:
    "Curating India's finest Banarasi brocades, pure Katan silks, and artisanal handloom yardage directly from the master looms of Varanasi.",
  ctaText: "Explore Silk Sarees",
  ctaLink: "/category/silk-sarees",
  desktopImg: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920",
  mobileImg: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
};

export const DEFAULT_SETTINGS = {
  storeName: "Shri Balaji Cotton Mills",
  supportEmail: "contact@shribalajicottonmills.in",
  supportPhone: "+91 98765 00000",
  freeShippingThreshold: 2000,
  standardShippingFee: 150,
  enableCod: true,
  codMaxOrderLimit: 15000,
  announcementText: "Free shipping on orders above ₹2,000 · Use code ATELIER10 for 10% off",
  enableAnnouncement: true,
};

export type StoreSettingsData = typeof DEFAULT_SETTINGS;
export type HeroData = typeof DEFAULT_HERO;
