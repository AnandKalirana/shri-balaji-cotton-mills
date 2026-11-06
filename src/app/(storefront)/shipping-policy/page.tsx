import type { Metadata } from "next";
import { PolicyList, PolicyPage, PolicySection } from "@/components/store/PolicyPage";
import { getStoreSettings } from "@/lib/catalog";
import { POLICY } from "@/lib/policies";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Shipping Policy" };
export const dynamic = "force-dynamic";

export default async function ShippingPolicyPage() {
  const s = await getStoreSettings();
  return (
    <PolicyPage title="Shipping Policy" intro={`This page explains how ${s.storeName} ships orders within India.`}>
      <PolicySection heading="Where we deliver">
        <p>We deliver to most pincodes across India through our courier partners. If your pincode cannot be served, we will contact you to arrange a refund or another option.</p>
      </PolicySection>
      <PolicySection heading="Shipping charges">
        <PolicyList
          items={[
            <>Orders of {formatPrice(s.freeShippingThreshold)} or more ship free.</>,
            <>Orders below {formatPrice(s.freeShippingThreshold)} have a flat shipping fee of {formatPrice(s.standardShippingFee)}.</>,
            "The shipping fee is shown at checkout before you pay.",
          ]}
        />
      </PolicySection>
      <PolicySection heading="Dispatch and delivery time">
        <PolicyList
          items={[
            `Orders are packed and dispatched within ${POLICY.dispatchDays} of confirmation.`,
            `Delivery usually takes ${POLICY.deliveryDays} after dispatch, depending on your location.`,
            "Fabric cut to your chosen length is prepared after you order, so dispatch can take a little longer on busy days.",
            "Delivery times are estimates. Courier delays, weather and public holidays can affect them.",
          ]}
        />
      </PolicySection>
      <PolicySection heading="Tracking">
        <p>When your order is shipped we add the courier name and tracking number to your order. You can see it in your account, and we can share it on request at {s.supportEmail}.</p>
      </PolicySection>
      <PolicySection heading="Cash on Delivery">
        <p>{s.enableCod ? `Cash on Delivery is available for orders up to ${formatPrice(s.codMaxOrderLimit)}. Please keep the exact amount ready.` : "Cash on Delivery is not available at the moment. Please pay online."}</p>
      </PolicySection>
      <PolicySection heading="Damaged or wrong parcel">
        <p>Please record a short video while opening your parcel. If anything is damaged or wrong, contact us within 48 hours of delivery with the video and photos, and we will fix it. See our Returns &amp; Refunds page.</p>
      </PolicySection>
    </PolicyPage>
  );
}
