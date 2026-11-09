"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, ImagePlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { api } from "@/lib/api-client";
import { categories } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { matchPhotos, type ImportRow } from "@/lib/product-import";

const card = "bg-white border border-[#e5e5e3]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] p-5 sm:p-6";

interface PreviewRow {
  line: number;
  errors: string[];
  duplicate: boolean;
  row: ImportRow | null;
}
interface Result {
  line: number;
  name: string;
  status: "created" | "skipped" | "failed";
  message: string;
}

/** Shrinks a phone or camera photo to a web-sized JPEG before it is uploaded. */
async function preparePhoto(file: File): Promise<File> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser can't prepare photos.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
  if (!blob) throw new Error("A photo couldn't be prepared.");
  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}

export default function AdminImportProductsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("stretchy-blouse");
  const [stock, setStock] = useState("10");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [rows, setRows] = useState<PreviewRow[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(0);
  const [results, setResults] = useState<Result[] | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);

  // Photo files are matched to products by design number: 5001.jpg, 5001-2.jpg, ...
  const matched = useMemo(() => {
    const designNos = (rows ?? []).flatMap((r) => (r.row?.designNo ? [r.row.designNo] : []));
    return matchPhotos(photos.map((f) => f.name), designNos);
  }, [photos, rows]);
  const filesFor = (r: PreviewRow): File[] => {
    const names = r.row?.designNo ? matched.byDesign.get(r.row.designNo) ?? [] : [];
    return names.map((n) => photos.find((f) => f.name === n)).filter((f): f is File => Boolean(f));
  };
  const hasPhoto = (r: PreviewRow) => filesFor(r).length > 0 || (r.row?.images.length ?? 0) > 0;
  const previews = useMemo(() => new Map(photos.map((f) => [f.name, URL.createObjectURL(f)])), [photos]);

  const ready = (rows ?? []).filter((r) => r.row && !r.duplicate && hasPhoto(r));
  const skipped = (rows ?? []).filter((r) => r.duplicate);
  const needPhoto = (rows ?? []).filter((r) => r.row && !r.duplicate && !hasPhoto(r));
  const problems = (rows ?? []).filter((r) => !r.row);

  const check = async () => {
    if (!file) return setError("Choose a file first.");
    setError("");
    setResults(null);
    setChecking(true);
    const body = new FormData();
    body.set("file", file);
    body.set("category", category);
    body.set("stock", stock);
    const res = await api<{ rows: PreviewRow[]; warnings: string[] }>("/api/admin/products/import/preview", { method: "POST", body });
    setChecking(false);
    if (res.ok) {
      setRows(res.data.rows);
      setWarnings(res.data.warnings);
    } else {
      setRows(null);
      setError(res.error);
    }
  };

  const runImport = async () => {
    setImporting(true);
    setDone(0);
    setError("");
    const all: Result[] = [];
    // Step 1: upload the photo files chosen here (they replace any links in the sheet for that product).
    const prepared: ImportRow[] = [];
    for (const r of ready) {
      const files = filesFor(r);
      if (!files.length) {
        prepared.push(r.row!);
        continue;
      }
      const urls: string[] = [];
      try {
        for (const f of files) {
          const body = new FormData();
          body.set("file", await preparePhoto(f));
          const up = await api<{ url: string }>("/api/admin/upload", { method: "POST", body });
          if (!up.ok) throw new Error(up.error);
          urls.push(up.data.url);
        }
        prepared.push({ ...r.row!, images: urls });
      } catch (e) {
        all.push({ line: r.line, name: r.row!.name, status: "failed", message: `Photo upload failed: ${e instanceof Error ? e.message : "unknown problem"}` });
        setDone(all.length);
      }
    }
    // Step 2: save the products a few at a time.
    for (let i = 0; i < prepared.length; i += 3) {
      const chunk = prepared.slice(i, i + 3);
      const res = await api<{ results: Result[] }>("/api/admin/products/import/commit", { method: "POST", json: { rows: chunk } });
      if (!res.ok) {
        setError(`${res.error} ${all.length ? `${all.length} product(s) were handled before this stopped.` : ""}`.trim());
        break;
      }
      all.push(...res.data.results);
      setDone(all.length);
    }
    setResults(all);
    setRows(null);
    setImporting(false);
  };

  const created = results?.filter((r) => r.status === "created").length ?? 0;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5c1d24] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to products
        </Link>
        <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-medium text-[#1a1a1a] mt-2">Import products from a file</h2>
        <p className="text-xs text-[#6f6f6f]">
          Upload an Excel or CSV file with one product per row. You see a preview first, and nothing is added until you confirm.
        </p>
      </div>

      {error && <Notice tone="error">{error}</Notice>}

      {!results && (
        <div className={`${card} space-y-5`}>
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="sm:col-span-3 block">
              <span className="text-xs font-semibold text-[#444444]">File (.xlsx or .csv, up to 500 products)</span>
              <input
                type="file"
                accept=".xlsx,.csv"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setRows(null);
                }}
                className="mt-1 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#5c1d24] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[#444444]">Category for rows without one</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full border-b border-[#c5a880] bg-transparent py-2.5 text-sm">
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[#444444]">Starting stock per size and colour</span>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="mt-1 w-full border-b border-[#c5a880] bg-transparent py-2.5 text-sm"
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={check} loading={checking} disabled={!file} className="rounded-full">
              <Upload className="w-4 h-4" /> Check file
            </Button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/api/admin/products/import/template" download className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5c1d24] hover:underline">
              <Download className="w-3.5 h-3.5" /> Download a blank template
            </a>
          </div>
          <p className="text-xs text-[#6f6f6f] leading-relaxed">
            Recognised columns: Design No., Product Name, MRP, Selling Price, Description, Available Colours, Sizes, Image URL, and optionally
            Category, Stock and Badge. Photos are copied from the links into your own storage. Every colour and size becomes a choice
            on the product page, each with its own stock. Importing the same file again adds sizes and colours to products you imported earlier.
          </p>
        </div>
      )}

      {rows && (
        <div className={`${card} space-y-3`}>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1a1a1a]">
            <ImagePlus className="w-4 h-4" /> Product photos (optional)
          </div>
          <p className="text-xs text-[#6f6f6f] leading-relaxed">
            Choose photo files named by design number: <strong>5001.jpg</strong> is the main photo of design 5001, and{" "}
            <strong>5001-2.jpg</strong> or <strong>5001_back.jpg</strong> are extra photos of it. A photo here replaces the link in the sheet.
            Photos are shrunk to a web size before upload.
          </p>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
            className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#5c1d24] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
          />
          {photos.length > 0 && (
            <p className="text-xs text-[#444444]">
              {photos.length - matched.unmatched.length} of {photos.length} photos matched to products.
              {matched.unmatched.length > 0 && <span className="text-rose-700"> No product found for: {matched.unmatched.slice(0, 8).join(", ")}{matched.unmatched.length > 8 ? "…" : ""}</span>}
            </p>
          )}
        </div>
      )}

      {rows && (
        <div className={`${card} space-y-4`}>
          {warnings.map((w) => (
            <Notice key={w} tone="warning">{w}</Notice>
          ))}
          <p className="text-sm text-[#1a1a1a]">
            <strong>{ready.length}</strong> ready to import
            {skipped.length > 0 && <>, <strong>{skipped.length}</strong> already in your store</>}
            {needPhoto.length > 0 && <>, <strong>{needPhoto.length}</strong> still need a photo</>}
            {problems.length > 0 && <>, <strong>{problems.length}</strong> with problems</>}.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[#6f6f6f] border-b border-[#e5e5e3]">
                  <th className="py-2 pr-3 font-medium">Row</th>
                  <th className="py-2 pr-3 font-medium">Photo</th>
                  <th className="py-2 pr-3 font-medium">Product</th>
                  <th className="py-2 pr-3 font-medium">Price</th>
                  <th className="py-2 pr-3 font-medium">Sizes / colours</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.line} className="border-b border-[#e5e5e3]/60 align-top">
                    <td className="py-2 pr-3 tabular-nums text-[#6f6f6f]">{r.line}</td>
                    <td className="py-2 pr-3">
                      {r.row && (filesFor(r)[0] || r.row.images[0]) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={filesFor(r)[0] ? previews.get(filesFor(r)[0].name) : r.row.images[0]} alt="" referrerPolicy="no-referrer" className="w-10 h-12 object-cover rounded bg-[#f3f3f1]" />
                      )}
                    </td>
                    <td className="py-2 pr-3 max-w-[280px]">
                      <div className="font-medium text-[#1a1a1a]">{r.row?.name ?? "—"}</div>
                      {r.row?.designNo && <div className="text-xs text-[#6f6f6f]">Design no. {r.row.designNo}</div>}
                    </td>
                    <td className="py-2 pr-3 tabular-nums">
                      {r.row && (
                        <>
                          {formatPrice(r.row.price)}
                          {r.row.mrp && <span className="ml-1 text-xs text-[#6f6f6f] line-through">{formatPrice(r.row.mrp)}</span>}
                        </>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-xs text-[#444444]">
                      {r.row && `${r.row.sizes.length || "No"} sizes, ${r.row.colours.length || "no"} colours`}
                    </td>
                    <td className="py-2 text-xs">
                      {r.row && !r.duplicate && hasPhoto(r) && <span className="text-emerald-700">Ready{filesFor(r).length > 0 && ` (${filesFor(r).length} photo${filesFor(r).length === 1 ? "" : "s"} to upload)`}</span>}
                      {r.row && !r.duplicate && !hasPhoto(r) && <span className="text-amber-700">Needs a photo: add a file named {r.row.designNo || "the design number"}.jpg</span>}
                      {r.duplicate && <span className="text-[#6f6f6f]">Already in store, will be skipped</span>}
                      {r.errors.map((e) => (
                        <div key={e} className="text-rose-700">{e}</div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button onClick={runImport} loading={importing} disabled={ready.length === 0} className="rounded-full">
              {importing ? `Importing ${done} of ${ready.length}…` : `Import ${ready.length} product${ready.length === 1 ? "" : "s"}`}
            </Button>
            {problems.length > 0 && <span className="text-xs text-[#6f6f6f]">Rows with problems are left out. Fix them in the file and check it again.</span>}
          </div>
        </div>
      )}

      {results && (
        <div className={`${card} space-y-4`}>
          <Notice tone={created > 0 ? "success" : "warning"}>
            {created} product{created === 1 ? "" : "s"} added
            {results.some((r) => r.status !== "created") && `, ${results.filter((r) => r.status !== "created").length} not added`}.
          </Notice>
          <ul className="text-sm space-y-1">
            {results.filter((r) => r.status !== "created" || r.message !== "Added.").map((r) => (
              <li key={r.line} className={r.status === "failed" ? "text-rose-700" : "text-[#444444]"}>
                Row {r.line}, {r.name}: {r.message}
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
            <Link href="/admin/products" className="px-5 py-2.5 rounded-full bg-[#5c1d24] text-white text-sm font-semibold">View products</Link>
            <button onClick={() => { setResults(null); setFile(null); }} className="text-sm font-semibold text-[#5c1d24] hover:underline">Import another file</button>
          </div>
        </div>
      )}
    </div>
  );
}
