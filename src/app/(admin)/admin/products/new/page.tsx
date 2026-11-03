"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Notice } from "@/components/ui/Notice";
import { ImageField } from "@/components/admin/ImageField";
import { api } from "@/lib/api-client";
import { categories } from "@/lib/data";

const card =
  "bg-white border border-[#ebe3d5]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] p-5 sm:p-6";

export default function AdminNewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    category: "silk-sarees",
    price: "",
    isFabric: false,
    pricePerMetre: "",
    widthInches: "44",
    stockQty: "1",
    composition: "",
    fabricType: "",
    badge: "",
    description: "",
  });
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showingSamples, setShowingSamples] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    api<{ demo: boolean }>("/api/admin/products").then((r) => r.ok && setShowingSamples(r.data.demo));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!image) {
      setError("Please add a product photo.");
      return;
    }
    setLoading(true);
    const res = await api("/api/admin/products", {
      method: "POST",
      json: {
        name: form.name,
        category: form.category,
        price: parseFloat(form.price),
        isFabric: form.isFabric,
        ...(form.isFabric
          ? { pricePerMetre: parseFloat(form.pricePerMetre), widthInches: parseFloat(form.widthInches) || 44 }
          : {}),
        stockQty: parseFloat(form.stockQty) || 0,
        composition: form.composition,
        fabricType: form.fabricType,
        badge: form.badge,
        description: form.description,
        images: [image],
      },
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/admin/products"), 900);
    } else {
      setError(res.error);
    }
  };

  const label = "block text-[11px] tracking-[0.14em] uppercase font-semibold text-[#534343] mb-1";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#534343] hover:bg-[#2b1e1a]/5 active:scale-95 transition-all"
          aria-label="Back to products"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-medium text-[#2b1e1a]">
            Add a product
          </h2>
          <p className="text-xs text-[#867273]">New sarees, fabric by the metre or bridal pieces appear on the store straight away.</p>
        </div>
      </div>

      {showingSamples && (
        <Notice tone="warning">
          Your store is currently showing the built-in sample products. Once you add your first real product, only real
          products will be shown. To keep the samples, go to{" "}
          <Link href="/admin/products" className="underline font-semibold">Products</Link> and choose “Import sample products” first.
        </Notice>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={card}>
          <ImageField
            label="Product photo"
            value={image}
            onChange={setImage}
            camera
            helper="Take a photo on your phone or choose one. JPG, PNG or WebP up to 5 MB."
          />
        </div>

        <div className={`${card} space-y-4`}>
          <Input
            label="Product title *"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Royal Wine Banarasi Katan Silk Saree"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className={label}>Category *</label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full bg-transparent border-0 border-b border-[#c5a880] py-3 text-sm text-[#2b1e1a] focus:outline-none focus:border-[#5c1d24]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <Input
              label="Fabric / weave type"
              value={form.fabricType}
              onChange={(e) => set("fabricType", e.target.value)}
              placeholder="e.g. Banarasi Silk"
            />
          </div>

          <Input
            label="Composition"
            value={form.composition}
            onChange={(e) => set("composition", e.target.value)}
            placeholder="e.g. 100% Pure Katan Silk with real zari"
          />

          <label className="flex items-center gap-3 pt-2 text-sm text-[#2b1e1a] cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFabric}
              onChange={(e) => set("isFabric", e.target.checked)}
              className="w-5 h-5 accent-[#5c1d24]"
            />
            <span>
              Also sold by the metre
              <span className="block text-xs text-[#867273]">Customers can choose a length or a full thaan roll.</span>
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={form.isFabric ? "Price for full piece (₹) *" : "Price (₹) *"}
              type="number"
              min={1}
              step="any"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              required
            />
            <Input
              label={form.isFabric ? "Stock (metres) *" : "Stock (units) *"}
              type="number"
              min={0}
              step={form.isFabric ? "0.5" : "1"}
              value={form.stockQty}
              onChange={(e) => set("stockQty", e.target.value)}
              required
            />
          </div>

          {form.isFabric && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Price per metre (₹) *"
                type="number"
                min={1}
                step="any"
                value={form.pricePerMetre}
                onChange={(e) => set("pricePerMetre", e.target.value)}
                required
              />
              <Input
                label="Fabric width (inches)"
                type="number"
                min={1}
                value={form.widthInches}
                onChange={(e) => set("widthInches", e.target.value)}
              />
            </div>
          )}

          <Input
            label="Badge (optional)"
            value={form.badge}
            onChange={(e) => set("badge", e.target.value)}
            placeholder="e.g. New, Bestseller"
          />

          <div>
            <label htmlFor="desc" className={label}>Description *</label>
            <textarea
              id="desc"
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the weave, motifs and drape…"
              required
              className="w-full bg-transparent border border-[#c5a880] rounded-2xl p-3 text-sm text-[#2b1e1a] focus:outline-none focus:border-[#5c1d24]"
            />
          </div>
        </div>

        {error && <Notice tone="error">{error}</Notice>}

        <Button type="submit" loading={loading} size="lg" className="w-full sm:w-auto rounded-full min-h-[50px]">
          {success ? (
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>Product added</span>
            </span>
          ) : (
            <span>Add product</span>
          )}
        </Button>
      </form>
    </div>
  );
}
