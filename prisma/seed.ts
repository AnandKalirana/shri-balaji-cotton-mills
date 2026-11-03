import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { importSampleCatalog } from "../src/lib/seed-catalog";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Shri Balaji Cotton Mills Database...");

  // 1. Admin User
  const passwordHash = await bcrypt.hash("Admin@12345", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@shribalajicottonmills.in" },
    update: {},
    create: {
      email: "admin@shribalajicottonmills.in",
      fullName: "Shri Balaji Cotton Mills Owner",
      phone: "+91 98765 00000",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("✓ Admin created: admin@shribalajicottonmills.in (Pass: Admin@12345)");

  // 2. Categories
  const categories = [
    { name: "Silk Sarees", slug: "silk-sarees", description: "Pure silk weaves from Varanasi and Kanchipuram", sortOrder: 1 },
    { name: "Banarasi Brocade", slug: "banarasi-brocade", description: "Exquisite zari brocade from the looms of Varanasi", sortOrder: 2 },
    { name: "Handloom Fabrics", slug: "handloom-fabrics", description: "Artisan handloom in cotton, linen and blended fibres", sortOrder: 3 },
    { name: "Bridal Collection", slug: "bridal-collection", description: "Bespoke bridal couture and lehenga fabrics", sortOrder: 4 },
    { name: "Dress Materials", slug: "dress-materials", description: "Ready-to-stitch fabrics for salwar suits and kurtis", sortOrder: 5 },
    { name: "Zari & Embroidery", slug: "zari-embroidery", description: "Embroidered panels, borders and zari work", sortOrder: 6 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✓ Categories seeded");

  // 3. Store Settings
  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      storeName: "Shri Balaji Cotton Mills",
      supportEmail: "contact@shribalajicottonmills.in",
      supportPhone: "+91 98765 00000",
      freeShippingThreshold: 2000,
      standardShippingFee: 150,
      enableCod: true,
      codMaxOrderLimit: 15000,
      announcementText: "Complimentary Insured Shipping Across India on Orders Above ₹2,000",
      enableAnnouncement: true,
    },
  });
  console.log("✓ Store settings initialized");

  // 4. Sample Banners
  await prisma.banner.upsert({
    where: { id: "banner-1" },
    update: {},
    create: {
      id: "banner-1",
      eyebrow: "The Winter Couture Edition",
      title: "Banarasi Royal Brocade & Katan Silk",
      subtitle: "Hand-loomed in Varanasi with genuine gold and silver zari filaments.",
      ctaText: "Explore The Loom",
      ctaLink: "/category/banarasi-brocade",
      desktopImg: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920",
      mobileImg: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
      sortOrder: 1,
      isActive: true,
    },
  });
  console.log("✓ CMS Banner seeded");

  // 5. Sample catalogue (skips anything already in the database)
  const imported = await importSampleCatalog(prisma);
  console.log(`✓ Sample catalogue: ${imported} product(s) added`);

  console.log("Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

