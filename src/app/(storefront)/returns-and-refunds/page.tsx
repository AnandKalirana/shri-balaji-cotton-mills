import type { Metadata } from "next";
import { PolicyList, PolicyPage, PolicySection } from "@/components/store/PolicyPage";
import { getStoreSettings } from "@/lib/catalog";
import { POLICY } from "@/lib/policies";

export const metadata: Metadata = { title: "Returns & Refunds" };
export const dynamic = "force-dynamic";

export default async function ReturnsPage() {
  const s = await getStoreSettings();
  return (
    <PolicyPage
      title="Returns & Refunds"
      intro={`We want you to be happy with every order. This page explains how returns, exchanges and refunds work at ${s.storeName}.`}
    >
      <PolicySection heading="Garments and ready-made items">
        <p>Kurta sets, kurtis, blouses, shapewear and men&apos;s wear can be returned or exchanged within {POLICY.returnWindowDays} days of delivery if they are:</p>
        <PolicyList
          items={[
            "unworn, unwashed and unaltered",
            "in the original packaging with tags attached",
            "free of perfume, stains and odour",
          ]}
        />
        <p>For hygiene reasons, shapewear can only be returned if it is unopened and sealed.</p>
      </PolicySection>
      <PolicySection heading="Fabric sold by the metre">
        <p>Fabric is cut to the length you order, so it cannot be returned or exchanged once cut, except when it is damaged, defective or not what you ordered. Uncut full rolls can be returned within {POLICY.returnWindowDays} days if unused and in original condition.</p>
        <p>Colours can look slightly different on different screens. A small variation in shade or weave is not a defect.</p>
      </PolicySection>
      <PolicySection heading="Damaged, defective or wrong item">
        <p>Contact us within 48 hours of delivery with your order number and clear photos or an unboxing video. We will send a replacement or refund you in full, including shipping.</p>
      </PolicySection>
      <PolicySection heading="How to request a return">
        <PolicyList
          items={[
            <>Email {s.supportEmail}{s.supportPhone ? ` or call ${s.supportPhone}` : ""} with your order number and the reason.</>,
            "We will confirm and arrange a pickup or tell you where to send the parcel.",
            "Once we receive and check the item, we process your refund or exchange.",
          ]}
        />
      </PolicySection>
      <PolicySection heading="Refunds">
        <PolicyList
          items={[
            `Refunds are made to the original payment method within ${POLICY.refundDays} after we approve the return. Your bank may take a few more days to show it.`,
            "For Cash on Delivery orders we refund to your bank account or UPI. We will ask you for the details.",
            "Shipping charges are refunded only if the return is due to our error.",
          ]}
        />
      </PolicySection>
      <PolicySection heading="Cancelling an order">
        <p>You can cancel before the order is shipped by contacting us. Paid orders are refunded within {POLICY.refundDays}.</p>
      </PolicySection>
    </PolicyPage>
  );
}
