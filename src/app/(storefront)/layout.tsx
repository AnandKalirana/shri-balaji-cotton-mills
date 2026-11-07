import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { getStoreSettings } from "@/lib/catalog";

// The storefront reads live content (products, banner, announcement), so never serve a stale build-time copy.
export const dynamic = "force-dynamic";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStoreSettings();
  return (
    <div className="flex flex-col min-h-screen bg-white store-clean">
      <StoreHeader
        storeName={settings.storeName}
        announcement={settings.enableAnnouncement ? settings.announcementText : null}
      />
      <main className="flex-1">{children}</main>
      <StoreFooter
        storeName={settings.storeName}
        phone={settings.supportPhone}
        email={settings.supportEmail}
        legalName={settings.legalName}
        gstin={settings.gstin}
        address={settings.address}
        businessHours={settings.businessHours}
        instagramUrl={settings.instagramUrl}
        facebookUrl={settings.facebookUrl}
        youtubeUrl={settings.youtubeUrl}
      />
      <CartDrawer />
    </div>
  );
}
