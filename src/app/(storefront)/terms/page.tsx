import type { Metadata } from "next";
import { PolicyList, PolicyPage, PolicySection } from "@/components/store/PolicyPage";
import { getStoreSettings } from "@/lib/catalog";

export const metadata: Metadata = { title: "Terms & Conditions" };
export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const s = await getStoreSettings();
  const owner = s.legalName || s.storeName;
  return (
    <PolicyPage
      title="Terms & Conditions"
      intro={`By using this website and placing an order you agree to these terms. The website is operated by ${owner}${s.gstin ? ` (GSTIN ${s.gstin})` : ""}.`}
    >
      <PolicySection heading="Products and prices">
        <PolicyList
          items={[
            "Prices are in Indian rupees and include GST unless stated otherwise.",
            "We try to show colours accurately, but screens differ, so small variations can occur.",
            "Fabric is sold by the metre or as a full roll. Measurements can differ by a small margin.",
            "We may change prices or withdraw products at any time. The price at the time you place your order applies.",
          ]}
        />
      </PolicySection>
      <PolicySection heading="Orders">
        <p>An order is accepted when we confirm it. We may cancel an order if an item is out of stock, a price was shown wrongly or we suspect fraud, and we will refund anything you have paid.</p>
      </PolicySection>
      <PolicySection heading="Payment">
        <p>You can pay online through Razorpay or, where available, by Cash on Delivery. You confirm that you are allowed to use the payment method you choose.</p>
      </PolicySection>
      <PolicySection heading="Shipping, returns and refunds">
        <p>These are explained on our Shipping Policy and Returns &amp; Refunds pages, which form part of these terms.</p>
      </PolicySection>
      <PolicySection heading="Your account">
        <p>Keep your password safe. You are responsible for activity under your account. Please give accurate details.</p>
      </PolicySection>
      <PolicySection heading="Using the website">
        <p>Do not misuse the website, attempt to break into it or copy our photos and content without permission. All logos, photos and text on this website belong to {owner} or its licensors.</p>
      </PolicySection>
      <PolicySection heading="Liability">
        <p>To the extent the law allows, our liability for any order is limited to the amount you paid for it.</p>
      </PolicySection>
      <PolicySection heading="Governing law">
        <p>These terms are governed by the laws of India. Disputes are subject to the courts of the city where our business is registered.</p>
      </PolicySection>
      <PolicySection heading="Contact">
        <p>Questions about these terms: {s.supportEmail}.</p>
      </PolicySection>
    </PolicyPage>
  );
}
