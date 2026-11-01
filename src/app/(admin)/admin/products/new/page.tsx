"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Camera, Upload, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { categories } from "@/lib/data";

export default function AdminNewProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    category: "silk-sarees",
    price: "",
    pricePerMetre: "",
    isFabric: false,
    stockQty: "25",
    composition: "100% Pure Katan Silk",
    fabricType: "Banarasi Silk",
    description: "",
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulation/API call
      await new Promise((res) => setTimeout(res, 800));
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/products");
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#ebe3d5]">
        <Link
          href="/admin/products"
          className="w-10 h-10 flex items-center justify-center text-[#534343] hover:bg-[#f0ede9] border border-[#ebe3d5]"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-medium text-[#2b1e1a]">
            Add Textile Creation
          </h2>
          <p className="text-xs text-[#867273]">
            Add new Banarasi sarees, fabric yardage, or bridal lehengas to the boutique
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mobile Camera Upload & Drag Zone */}
        <div className="bg-white border border-[#ebe3d5]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] p-5 sm:p-6">
          <label className="block text-[11px] tracking-[0.14em] uppercase font-semibold text-[#534343] mb-3">
            Product Photography (Mobile Camera or Upload)
          </label>

          <div className="border-2 border-dashed border-[#c5a880] p-6 text-center bg-[#faf7f2] relative">
            {previewImage ? (
              <div className="flex flex-col items-center">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-32 h-40 object-cover border border-[#c5a880] mb-3"
                />
                <p className="text-xs text-emerald-700 font-semibold">
                  Photo captured successfully
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 bg-[#f0ede9] text-[#5c1d24] flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#2b1e1a]">
                    Snap photo with phone camera or select file
                  </p>
                  <p className="text-[10px] text-[#867273] mt-0.5">
                    Floor staff can directly photograph new arrivals
                  </p>
                </div>
              </div>
            )}

            {/* Hidden native input with camera capture support */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageCapture}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Basic Details */}
        <div className="bg-white border border-[#ebe3d5]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] p-5 sm:p-6 space-y-4">
          <Input
            label="Creation Title *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Royal Wine Banarasi Katan Silk Saree"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] tracking-[0.14em] uppercase font-semibold text-[#534343] mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full bg-transparent border-0 border-b border-[#c5a880] py-3 text-sm text-[#2b1e1a] focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Fabric Composition *"
              value={formData.composition}
              onChange={(e) =>
                setFormData({ ...formData, composition: e.target.value })
              }
              placeholder="e.g. Pure Mulberry Silk with Real Zari"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Base Price (₹) *"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="18500"
              required
            />

            <Input
              label="Initial Stock Balance *"
              type="number"
              value={formData.stockQty}
              onChange={(e) =>
                setFormData({ ...formData, stockQty: e.target.value })
              }
              placeholder="25"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.14em] uppercase font-semibold text-[#534343] mb-1">
              Curatorial Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe the weaving technique, motif narrative, and drape..."
              className="w-full bg-transparent border border-[#c5a880] p-3 text-sm text-[#2b1e1a] focus:outline-none"
            />
          </div>
        </div>

        <Button
          type="submit"
          loading={loading}
          size="lg"
          className="w-full sm:w-auto min-h-[50px]"
        >
          {success ? (
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>Creation Published to Catalog</span>
            </span>
          ) : (
            <span>Publish New Product</span>
          )}
        </Button>
      </form>
    </div>
  );
}

