"use client";
import { useStoreSettings } from "@/lib/use-store-settings";
import Link from "next/link";
import Image from "next/image";
import { Drawer } from "@/components/ui/Drawer";
import { useCartStore, cartLineKey } from "@/store";
import { formatPrice } from "@/lib/utils";
import { Trash2, ArrowRight } from "lucide-react";

export function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, total } =
    useCartStore();

  const cartTotal = total();
  const { freeShippingThreshold } = useStoreSettings();
  const progressToFreeShipping =
    freeShippingThreshold > 0
      ? Math.min(100, Math.round((cartTotal / freeShippingThreshold) * 100))
      : 100;
  const remainingForFree = Math.max(0, freeShippingThreshold - cartTotal);

  return (
    <Drawer
      open={isOpen}
      onClose={toggleCart}
      title="Shri Balaji Cotton Mills Cart"
      side="right"
    >
      <div className="flex flex-col h-full justify-between p-6">
        {/* Free Shipping Tracker */}
        <div className="pb-4 mb-4 border-b border-[#e5e5e3]">
          <div className="flex items-center justify-between text-xs text-[#444444] mb-1.5">
            <span>
              {remainingForFree === 0
                ? "Complimentary insured shipping applied"
                : `Add ${formatPrice(remainingForFree)} more for free shipping`}
            </span>
            <span className="font-semibold text-[#5c1d24]">
              {progressToFreeShipping}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#e5e5e3]">
            <div
              className="h-full bg-[#5c1d24] transition-[width] duration-500"
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#e5e5e3] -mx-6 px-6">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-[family-name:var(--font-playfair)] text-xl text-[#1a1a1a] mb-2">
                Your Bag is Empty
              </p>
              <p className="text-xs text-[#6f6f6f] max-w-xs mx-auto mb-6">
                Browse fabrics, kurta sets, kurtis, stretchy blouses and saree shapewear.
              </p>
              <button
                onClick={toggleCart}
                className="inline-flex px-6 py-3 text-xs font-medium border border-[#c5a880] text-[#1a1a1a] hover:bg-[#faf7f2]"
              >
                Continue Browsing
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={cartLineKey(item)} className="py-4 flex gap-4">
                {/* Thumbnail */}
                <div className="relative w-20 h-24 shrink-0 bg-[#f3f3f1] border border-[#e5e5e3]">
                  <Image
                    src={
                      item.image ||
                      item.product.images?.[0] ||
                      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800"
                    }
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h4 className="font-[family-name:var(--font-playfair)] text-sm font-medium text-[#1a1a1a] truncate">
                      {item.product.name}
                    </h4>

                    {item.metres ? (
                      <p className="text-xs text-[#6f6f6f] mt-0.5">
                        Cut: <span className="font-semibold text-[#1a1a1a]">{item.metres} metres</span>
                        {item.isFullThaan && " (Full Thaan Roll)"}
                      </p>
                    ) : (
                      <p className="text-xs text-[#6f6f6f] mt-0.5">
                        {[item.colour, item.size].filter(Boolean).join(" · ") || `Qty: ${item.quantity}`}
                      </p>
                    )}

                    <p className="text-sm font-semibold text-[#5c1d24] mt-1">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-[#c5a880]">
                      <button
                        onClick={() =>
                          updateQuantity(cartLineKey(item), item.quantity - 1)
                        }
                        className="w-8 h-8 flex items-center justify-center text-xs text-[#1a1a1a] hover:bg-[#f5f5f3]"
                        aria-label="Decrease"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(cartLineKey(item), item.quantity + 1)
                        }
                        className="w-8 h-8 flex items-center justify-center text-xs text-[#1a1a1a] hover:bg-[#f5f5f3]"
                        aria-label="Increase"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(cartLineKey(item))}
                      className="text-[#6f6f6f] hover:text-[#ba1a1a] p-1.5 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="pt-4 mt-4 border-t border-[#e5e5e3]">
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-xs font-medium text-[#444444]">
                Estimated Subtotal
              </span>
              <span className="text-lg font-semibold text-[#1a1a1a]">
                {formatPrice(cartTotal)}
              </span>
            </div>
            <p className="text-[11px] text-[#6f6f6f] mb-4">
              Taxes and insured shipping calculated at checkout.
            </p>

            <Link
              href="/checkout"
              onClick={toggleCart}
              className="w-full py-4 bg-[#5c1d24] hover:bg-[#1a1a1a] text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors min-h-[48px]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </Drawer>
  );
}

