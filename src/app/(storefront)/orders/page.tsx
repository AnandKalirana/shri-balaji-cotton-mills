import Link from "next/link";

export default function OrdersPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-ink mb-3">My Orders</h1>
      <p className="text-graphite mb-8">Order history will appear here once customer order tracking is connected.</p>
      <Link href="/account" className="text-xs font-medium text-wine underline">
        Back to account
      </Link>
    </div>
  );
}
