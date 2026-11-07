"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X } from "lucide-react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { ImageField } from "@/components/admin/ImageField";
import { sortSizes } from "@/lib/colours";

const card = "bg-white border border-[#e5e5e3]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] p-5 sm:p-6";
const input = "h-10 px-3 rounded-lg border border-[#e5e5e3] bg-white text-sm focus:outline-none focus:border-[#5c1d24]";

interface Loaded {
  id: string;
  name: string;
  slug: string;
  isFabric: boolean;
  images: string[];
  colourImages: Record<string, string[]>;
  variants: { colour: string; size: string; stockQty: number }[];
}

const cellKey = (c: string, s: string) => `${c}||${s}`;
const splitList = (v: string) => [...new Set(v.split(/[,;\n]+/).map((x) => x.replace(/\s+/g, " ").trim()).filter(Boolean))];

export default function AdminProductOptionsPage() {
  const { id } = useParams<{ id: string }>();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const [colours, setColours] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [photos, setPhotos] = useState<Record<string, string[]>>({});
  const [stock, setStock] = useState<Record<string, string>>({});
  const [addColours, setAddColours] = useState("");
  const [addSizes, setAddSizes] = useState("");
  const [addStock, setAddStock] = useState("10");

  const apply = useCallback((d: Loaded) => {
    setLoaded(d);
    setColours([...new Set(d.variants.map((v) => v.colour).filter(Boolean))]);
    setSizes(sortSizes([...new Set(d.variants.map((v) => v.size).filter(Boolean))]));
    setPhotos(d.colourImages);
    setStock(Object.fromEntries(d.variants.map((v) => [cellKey(v.colour, v.size), String(v.stockQty)])));
  }, []);

  useEffect(() => {
    let live = true;
    api<Loaded>(`/api/admin/products/${id}/options`).then((res) => {
      if (!live) return;
      if (res.ok) apply(res.data);
      else setError(res.error);
    });
    return () => {
      live = false;
    };
  }, [id, apply]);

  // With no sizes (or no colours) listed, there is a single blank column (or row).
  const rowColours = colours.length ? colours : [""];
  const colSizes = sizes.length ? sizes : [""];

  function generate() {
    const newC = splitList(addColours);
    const newS = splitList(addSizes);
    const mergedC = [...colours, ...newC.filter((c) => !colours.some((x) => x.toLowerCase() === c.toLowerCase()))];
    const mergedS = sortSizes([...sizes, ...newS.filter((s) => !sizes.some((x) => x.toLowerCase() === s.toLowerCase()))]);
    const n = Number(addStock);
    const start = Number.isInteger(n) && n >= 0 ? String(n) : "0";
    const next = { ...stock };
    for (const c of mergedC.length ? mergedC : [""]) {
      for (const s of mergedS.length ? mergedS : [""]) {
        // Only the new pairs get the starting stock; typed-in numbers stay as they are.
        if (next[cellKey(c, s)] === undefined) next[cellKey(c, s)] = start;
      }
    }
    // Drop the blank "no colour / no size" placeholders once real choices exist.
    for (const k of Object.keys(next)) {
      const [c, s] = k.split("||");
      if ((mergedC.length && !c) || (mergedS.length && !s)) delete next[k];
    }
    setColours(mergedC);
    setSizes(mergedS);
    setStock(next);
    setAddColours("");
    setAddSizes("");
  }

  function removeColour(c: string) {
    setColours(colours.filter((x) => x !== c));
    setStock(Object.fromEntries(Object.entries(stock).filter(([k]) => k.split("||")[0] !== c)));
  }
  function removeSize(s: string) {
    setSizes(sizes.filter((x) => x !== s));
    setStock(Object.fromEntries(Object.entries(stock).filter(([k]) => k.split("||")[1] !== s)));
  }
  function setPhoto(c: string, i: number, url: string) {
    const list = [...(photos[c] ?? [])];
    if (url) list[i] = url;
    else list.splice(i, 1);
    setPhotos({ ...photos, [c]: list.filter(Boolean) });
  }

  const total = useMemo(() => Object.values(stock).reduce((s, v) => s + (Number(v) || 0), 0), [stock]);

  async function save() {
    setMessage(null);
    const cells = Object.entries(stock)
      .filter(([, v]) => v.trim() !== "")
      .map(([k, v]) => {
        const [colour, size] = k.split("||");
        return { colour, size, stock: Number(v) };
      });
    if (cells.some((c) => !Number.isInteger(c.stock) || c.stock < 0)) {
      setMessage({ kind: "error", text: "Stock must be a whole number, 0 or more." });
      return;
    }
    setSaving(true);
    const res = await api(`/api/admin/products/${id}/options`, {
      method: "PUT",
      json: { colours: colours.map((name) => ({ name, images: photos[name] ?? [] })), sizes, cells },
    });
    setSaving(false);
    if (!res.ok) setMessage({ kind: "error", text: res.error });
    else {
      setMessage({ kind: "success", text: "Saved. The product page now shows these colours and sizes." });
      const fresh = await api<Loaded>(`/api/admin/products/${id}/options`);
      if (fresh.ok) apply(fresh.data);
    }
  }

  if (error) {
    return (
      <div className="max-w-3xl space-y-4">
        <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-[#444444] hover:text-[#1a1a1a]"><ArrowLeft className="w-4 h-4" /> Products</Link>
        <Notice tone="error">{error}</Notice>
      </div>
    );
  }
  if (!loaded) return <p className="text-sm text-[#6f6f6f]">Loading…</p>;
  if (loaded.isFabric) {
    return (
      <div className="max-w-3xl space-y-4">
        <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-[#444444] hover:text-[#1a1a1a]"><ArrowLeft className="w-4 h-4" /> Products</Link>
        <Notice tone="info">Fabrics are sold by the metre, so they have no sizes or colours.</Notice>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-[#444444] hover:text-[#1a1a1a]"><ArrowLeft className="w-4 h-4" /> Products</Link>
      <div>
        <h1 className="text-2xl font-semibold text-[#1a1a1a]">Sizes and colours</h1>
        <p className="text-sm text-[#6f6f6f] mt-1">{loaded.name}</p>
      </div>

      {message && <Notice tone={message.kind}>{message.text}</Notice>}

      <section className={card}>
        <h2 className="text-sm font-semibold text-[#1a1a1a]">Add colours and sizes</h2>
        <p className="text-xs text-[#6f6f6f] mt-1">Separate with commas. Every new colour and size pairing gets the starting stock below.</p>
        <div className="grid sm:grid-cols-3 gap-3 mt-4">
          <label className="block text-xs font-medium text-[#444444]">
            Colours
            <input className={`${input} w-full mt-1`} value={addColours} onChange={(e) => setAddColours(e.target.value)} placeholder="Red, Black, Maroon" />
          </label>
          <label className="block text-xs font-medium text-[#444444]">
            Sizes
            <input className={`${input} w-full mt-1`} value={addSizes} onChange={(e) => setAddSizes(e.target.value)} placeholder="L, XL, XXL" />
          </label>
          <label className="block text-xs font-medium text-[#444444]">
            Starting stock for each
            <input className={`${input} w-full mt-1`} inputMode="numeric" value={addStock} onChange={(e) => setAddStock(e.target.value)} />
          </label>
        </div>
        <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={generate} disabled={!addColours.trim() && !addSizes.trim()}>
          <Plus className="w-4 h-4" /> Add to the table
        </Button>
      </section>

      {(colours.length > 0 || sizes.length > 0 || Object.keys(stock).length > 0) && (
        <section className={card}>
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <h2 className="text-sm font-semibold text-[#1a1a1a]">Stock for each colour and size</h2>
            <p className="text-xs text-[#6f6f6f]">{total} pieces in total. Leave a box empty if you don&apos;t sell that pairing.</p>
          </div>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[#6f6f6f]">
                  <th className="py-2 pr-3 font-medium">Colour</th>
                  {colSizes.map((s) => (
                    <th key={s} className="py-2 px-1 font-medium text-center">
                      <span className="inline-flex items-center gap-1">
                        {s || "Any size"}
                        {s && <button type="button" onClick={() => removeSize(s)} aria-label={`Remove size ${s}`} className="text-[#6f6f6f] hover:text-[#ba1a1a]"><X className="w-3 h-3" /></button>}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowColours.map((c) => (
                  <tr key={c || "none"} className="border-t border-[#e5e5e3]/70">
                    <td className="py-2 pr-3 font-medium text-[#1a1a1a] whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        {c || "Any colour"}
                        {c && <button type="button" onClick={() => removeColour(c)} aria-label={`Remove colour ${c}`} className="text-[#6f6f6f] hover:text-[#ba1a1a]"><X className="w-3 h-3" /></button>}
                      </span>
                    </td>
                    {colSizes.map((s) => (
                      <td key={s} className="py-2 px-1 text-center">
                        <input
                          aria-label={`Stock for ${c || "any colour"} ${s || "any size"}`}
                          className={`${input} w-16 text-center`}
                          inputMode="numeric"
                          value={stock[cellKey(c, s)] ?? ""}
                          onChange={(e) => setStock({ ...stock, [cellKey(c, s)]: e.target.value.replace(/[^0-9]/g, "") })}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {colours.length > 0 && (
        <section className={card}>
          <h2 className="text-sm font-semibold text-[#1a1a1a]">Photos for each colour</h2>
          <p className="text-xs text-[#6f6f6f] mt-1">
            When a customer taps a colour, these photos replace the main ones. A colour without photos shows the product&apos;s main photos.
          </p>
          <div className="space-y-6 mt-5">
            {colours.map((c) => {
              const list = photos[c] ?? [];
              return (
                <div key={c}>
                  <p className="text-sm font-medium text-[#1a1a1a] mb-3">{c}</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {list.map((url, i) => (
                      <ImageField key={url + i} label={`Photo ${i + 1}`} value={url} onChange={(u) => setPhoto(c, i, u)} />
                    ))}
                    {list.length < 6 && (
                      <ImageField key={`new-${list.length}`} label={list.length ? "Add another photo" : "Add a photo"} value="" onChange={(u) => u && setPhoto(c, list.length, u)} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex items-center gap-3 sticky bottom-4">
        <Button type="button" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        <Link href={`/product/${loaded.slug}`} target="_blank" className="text-sm font-semibold text-[#5c1d24] hover:underline">View product page</Link>
      </div>
    </div>
  );
}
