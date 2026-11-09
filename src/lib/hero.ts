/** Default homepage hero copy, used until a banner is saved in the CMS. */
export const DEFAULT_HERO = {
  eyebrow: "Shri Balaji Cotton Mills",
  title: "Fabrics, Kurtis &\nEveryday Essentials",
  subtitle:
    "Quality cotton fabrics, kurta sets, kurtis, stretchy blouses and saree shapewear, made for comfort and sold at honest prices.",
  ctaText: "Shop Fabrics",
  ctaLink: "/category/fabrics",
  desktopImg: "",
  mobileImg: "",
  imageOnly: false,
};

export const DEFAULT_SETTINGS = {
  storeName: "Shri Balaji Cotton Mills",
  supportEmail: "contact@shribalajicottonmills.in",
  supportPhone: "+91 98765 00000",
  legalName: "",
  gstin: "",
  address: "",
  businessHours: "Mon – Sat: 10:00 AM – 7:00 PM IST",
  instagramUrl: "",
  facebookUrl: "",
  youtubeUrl: "",
  freeShippingThreshold: 2000,
  standardShippingFee: 150,
  enableCod: true,
  codMaxOrderLimit: 15000,
  announcementText: "Free shipping on orders above ₹2,000",
  enableAnnouncement: true,
};

export type StoreSettingsData = typeof DEFAULT_SETTINGS;
export type HeroData = typeof DEFAULT_HERO;
