import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { importSampleCatalog, syncCategories } from "../src/lib/seed-catalog";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Shri Balaji Cotton Mills Database...");

  // 1. Admin user — credentials come from the environment, nothing is hard-coded.
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    if (adminPassword.length < 12) {
      throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
    }
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {}, // never overwrite an existing admin's password
      create: {
        email: adminEmail,
        fullName: "Shri Balaji Cotton Mills Owner",
        phone: "+91 98765 00000",
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log(`✓ Admin ready: ${adminEmail}`);
  } else {
    console.log("! No admin created. Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) and run the seed again.");
  }

  // 2. Categories (Fabrics, Kurta Set, Kurti, Stretchy Blouse, Saree Shapewear)
  await syncCategories(prisma);
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
      announcementText: "Free shipping on orders above ₹2,000",
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
      eyebrow: "Shri Balaji Cotton Mills",
      title: "Fabrics, Kurtis & Everyday Essentials",
      subtitle: "Quality cotton fabrics, kurta sets, kurtis, stretchy blouses and saree shapewear.",
      ctaText: "Shop Now",
      ctaLink: "/category/fabrics",
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

