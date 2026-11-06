import type { Metadata } from "next";
import { PolicyList, PolicyPage, PolicySection } from "@/components/store/PolicyPage";
import { getStoreSettings } from "@/lib/catalog";

export const metadata: Metadata = { title: "Privacy Policy" };
export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const s = await getStoreSettings();
  const owner = s.legalName || s.storeName;
  return (
    <PolicyPage
      title="Privacy Policy"
      intro={`${owner} (“we”, “us”) runs this website. This policy explains what personal information we collect, how we use it and the choices you have.`}
    >
      <PolicySection heading="What we collect">
        <PolicyList
          items={[
            "Details you give us: name, email, phone number, delivery address and your account password (stored in a scrambled form, never in plain text).",
            "Order details: the items you buy, amounts and delivery status.",
            "Technical data: basic information such as browser type and pages visited, used to keep the site working and secure.",
          ]}
        />
      </PolicySection>
      <PolicySection heading="How we use it">
        <PolicyList
          items={[
            "To process and deliver your orders and contact you about them.",
            "To handle payments, returns, refunds and support requests.",
            "To keep our website secure and to prevent fraud.",
            "To tell you about offers, only if you have agreed, and you can opt out at any time.",
          ]}
        />
      </PolicySection>
      <PolicySection heading="Who we share it with">
        <p>We share only what is needed with service providers who help us run the store: payment gateway (Razorpay), courier partners, and hosting and database providers. We do not sell your personal information.</p>
      </PolicySection>
      <PolicySection heading="Payments">
        <p>Online payments are handled by Razorpay. We never see or store your card, UPI PIN or net-banking credentials.</p>
      </PolicySection>
      <PolicySection heading="Cookies">
        <p>We use a login cookie to keep you signed in, and your cart is kept in your browser while you shop. We do not use advertising cookies unless we tell you so on this page.</p>
      </PolicySection>
      <PolicySection heading="Keeping your data safe and how long we keep it">
        <p>We use reasonable security measures to protect your data. We keep order records for as long as the law requires for accounting and tax, and other data until you ask us to delete it.</p>
      </PolicySection>
      <PolicySection heading="Your choices">
        <p>You can ask to see, correct or delete your personal information by writing to {s.supportEmail}. We will respond within a reasonable time, and keep only what we are legally required to.</p>
      </PolicySection>
      <PolicySection heading="Contact">
        <p>Questions about this policy: {s.supportEmail}{s.address ? `, ${s.address.replace(/\n/g, ", ")}` : ""}.</p>
      </PolicySection>
    </PolicyPage>
  );
}
