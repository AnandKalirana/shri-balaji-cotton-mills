import { categories } from "@/lib/data";

/** One product row, cleaned up and ready to be saved. */
export interface ImportRow {
  line: number;
  designNo: string;
  /** Design number plus category, so 101 in kurta sets and 101 in shapewear stay different products. */
  code: string;
  name: string;
  mrp?: number;
  price: number;
  description: string;
  sizes: string[];
  colours: string[];
  images: string[];
  category: string;
  stock: number;
  badge: string;
}

export interface ParsedRow {
  line: number;
  row: ImportRow | null;
  errors: string[];
}

export const MAX_IMPORT_ROWS = 500;
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

/** The column names we recognise (lower case, letters and numbers only). */
const COLUMNS: Record<string, string[]> = {
  designNo: ["designno", "dno", "design", "sku", "code", "itemcode", "styleno"],
  name: ["productname", "name", "title", "producttitle"],
  mrp: ["mrp", "mrpinr", "mrpinrs", "mrprs", "listprice", "originalprice", "compareatprice"],
  price: ["sellingprice", "sellingpriceinr", "price", "priceinr", "saleprice", "offerprice"],
  description: ["description", "descriptionmaterial", "details", "material"],
  colours: ["availablecolours", "availablecolors", "colours", "colors", "colour", "color"],
  sizes: ["sizes", "size", "availablesizes"],
  images: ["imageurl", "imageurls", "images", "image", "photo", "photos", "imagelink"],
  category: ["category", "categoryslug", "department"],
  stock: ["stock", "stockqty", "quantity", "qty", "inventory"],
  badge: ["badge", "tag", "label"],
};

const norm = (s: unknown) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

/** Reads a CSV file, handling quoted cells, commas and new lines inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((x) => x.trim() !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim() !== "")) rows.push(row);
  return rows;
}

/** Cell text that really means "nothing here". */
function blank(v: string) {
  return !v || /^(not captured|not available|n\/?a|none|null|-+)$/i.test(v) || /^material details not/i.test(v);
}

function text(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v).replace(/\s+/g, " ").trim();
  return blank(s) ? "" : s;
}

function money(v: unknown): number | undefined {
  if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
  const s = String(v ?? "").replace(/[₹,]|rs\.?|inr/gi, "").trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function list(v: unknown): string[] {
  const s = String(v ?? "");
  if (blank(s.trim())) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of s.split(/[,;|\n]+/)) {
    const t = part.replace(/\s+/g, " ").trim();
    if (t && !blank(t) && !seen.has(t.toLowerCase())) {
      seen.add(t.toLowerCase());
      out.push(t);
    }
  }
  return out;
}

function urls(v: unknown): string[] {
  const found = String(v ?? "").match(/https?:\/\/[^\s|,]+/g) ?? [];
  return [...new Set(found)].slice(0, 6);
}

/** Other spellings people use in sheets for the categories we have. */
const CATEGORY_ALIASES: Record<string, string> = { kurta: "kurti", kurtas: "kurti", kurtis: "kurti", fabric: "fabrics" };

function categorySlug(v: string, fallback: string): string | null {
  if (!v) return fallback;
  const n = norm(v);
  if (CATEGORY_ALIASES[n]) return CATEGORY_ALIASES[n];
  const hit = categories.find((c) => norm(c.slug) === n || norm(c.name) === n);
  return hit ? hit.slug : null;
}

export interface ImportDefaults {
  category: string;
  stock: number;
}

/** Turns a table of cells (first row = headings) into cleaned products and per-row problems. */
export function parseTable(table: unknown[][], defaults: ImportDefaults): { rows: ParsedRow[]; warnings: string[] } {
  const warnings: string[] = [];
  if (table.length < 2) return { rows: [], warnings: ["The file has no product rows."] };

  const header = table[0].map(norm);
  const col: Record<string, number> = {};
  for (const [field, names] of Object.entries(COLUMNS)) {
    const idx = header.findIndex((h) => names.includes(h));
    if (idx >= 0) col[field] = idx;
  }
  if (col.name === undefined) warnings.push("No product name column found. Add a column called “Product Name”.");
  if (col.price === undefined) warnings.push("No price column found. Add a column called “Selling Price”.");
  if (col.images === undefined) warnings.push("No photo column found. Add a column called “Image URL”, or upload the photo files on this screen.");

  const rows: ParsedRow[] = [];
  const dataRows = table.slice(1, MAX_IMPORT_ROWS + 1);
  if (table.length - 1 > MAX_IMPORT_ROWS) warnings.push(`Only the first ${MAX_IMPORT_ROWS} rows are read. Split the file to import the rest.`);

  dataRows.forEach((cells, i) => {
    const line = i + 2;
    const get = (f: string) => (col[f] === undefined ? undefined : cells[col[f]]);
    if (cells.every((c) => String(c ?? "").trim() === "")) return;

    const errors: string[] = [];
    const name = text(get("name"));
    const price = money(get("price"));
    let mrp = money(get("mrp"));
    const images = urls(get("images"));
    const designNo = text(get("designNo")).replace(/\s+/g, "");
    const category = categorySlug(text(get("category")), defaults.category);
    const stockCell = money(get("stock"));
    const isFabric = category === "fabrics";
    // Fabric is sold by the metre: there are no sizes ("Per Metre" in the sheet is not a size).
    // The colour names are kept in the description, because the photo shows one colourway.
    const sizes = isFabric ? [] : list(get("sizes"));
    const allColours = list(get("colours"));
    const colours = isFabric ? [] : allColours;

    if (name.length < 2) errors.push("Product name is missing.");
    if (name.length > 140) errors.push("Product name is longer than 140 characters.");
    if (!price || price <= 0) errors.push("Selling price is missing or not a number.");
    if (category === null) errors.push(`Unknown category “${text(get("category"))}”.`);
    if (stockCell !== undefined && (stockCell < 0 || !Number.isInteger(stockCell))) errors.push("Stock must be a whole number, 0 or more.");
    if (mrp !== undefined && price && mrp <= price) mrp = undefined; // no discount to show

    const details = text(get("description"));
    const parts = [details || name];
    if (isFabric) {
      parts.push("Sold per metre.");
      if (allColours.length) parts.push(`Colour shown: ${allColours[0]}.`);
      if (allColours.length > 1) parts.push(`Also made in: ${allColours.slice(1).join(", ")}. Message us on WhatsApp to order another colour.`);
    }
    if (designNo) parts.push(`Design no. ${designNo}`);
    const description = parts.join("\n\n").slice(0, 4000);

    rows.push({
      line,
      errors,
      row: errors.length
        ? null
        : {
            line,
            designNo,
            code: designNo && category ? `${category}-${designNo}` : "",
            name,
            mrp,
            price: price!,
            description,
            sizes,
            colours,
            images,
            category: category!,
            stock: stockCell ?? defaults.stock,
            badge: text(get("badge")).slice(0, 30),
          },
    });
  });

  // Same design number twice in one file: keep the first, flag the rest.
  const seen = new Set<string>();
  for (const r of rows) {
    if (!r.row?.designNo) continue;
    const k = r.row.designNo.toLowerCase();
    if (seen.has(k)) {
      r.errors.push(`Design no. ${r.row.designNo} appears more than once in this file.`);
      r.row = null;
    } else seen.add(k);
  }
  return { rows, warnings };
}

/**
 * Matches photo file names to design numbers. "5001.jpg" is the main photo of design 5001,
 * and "5001-2.jpg", "5001_back.jpg" or "5001 (2).jpg" are extra photos of the same design.
 * Returns, for each design number, its file names in order, plus the names that matched nothing.
 */
export function matchPhotos(fileNames: string[], designNos: string[]): { byDesign: Map<string, string[]>; unmatched: string[] } {
  const key = (d: string) => d.toLowerCase().replace(/\s+/g, "");
  const designs = [...new Set(designNos.filter(Boolean))].sort((a, b) => b.length - a.length); // longest first: "5001" beats "5"
  const found = new Map<string, { name: string; rest: string }[]>();
  const unmatched: string[] = [];

  for (const name of fileNames) {
    const stem = key(name.replace(/\.[a-z0-9]+$/i, ""));
    let hit: { design: string; rest: string } | null = null;
    for (const d of designs) {
      const k = key(d);
      if (stem === k) {
        hit = { design: d, rest: "" };
        break;
      }
      const m = stem.startsWith(k) && /^[-_(.]/.test(stem.slice(k.length));
      if (m) {
        hit = { design: d, rest: stem.slice(k.length) };
        break;
      }
    }
    if (!hit) {
      unmatched.push(name);
      continue;
    }
    const list = found.get(hit.design) ?? [];
    list.push({ name, rest: hit.rest });
    found.set(hit.design, list);
  }

  const byDesign = new Map<string, string[]>();
  for (const [d, list] of found) {
    list.sort((a, b) => a.rest.localeCompare(b.rest, undefined, { numeric: true }));
    byDesign.set(d, list.map((x) => x.name).slice(0, 6));
  }
  return { byDesign, unmatched };
}

export const TEMPLATE_CSV =
  "Design No.,Product Name,MRP (INR),Selling Price (INR),Description / Material,Available Colours,Sizes,Image URL,Category,Stock,Badge\n" +
  '101,Stretchy Cotton Blouse with Net Sleeve,749,349,"Cotton + lycra; net elbow sleeves","Red, Black, Maroon","L, XL, XXL",https://example.com/photo-101.jpg,stretchy-blouse,10,\n';
