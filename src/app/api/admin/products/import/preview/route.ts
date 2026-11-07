import { NextResponse } from "next/server";
import readXlsxFile from "read-excel-file/node";
import { prisma } from "@/lib/prisma";
import { requireAdmin, dbErrorResponse } from "@/lib/admin-guard";
import { categories } from "@/lib/data";
import { MAX_IMPORT_BYTES, parseCsv, parseTable } from "@/lib/product-import";

/** Reads an uploaded .xlsx or .csv file and reports what would be imported. Saves nothing. */
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a file first." }, { status: 400 });
  if (file.size > MAX_IMPORT_BYTES) return NextResponse.json({ error: "The file is larger than 2 MB. Split it into smaller files." }, { status: 400 });

  const category = String(form?.get("category") || "stretchy-blouse");
  if (!categories.some((c) => c.slug === category)) return NextResponse.json({ error: "Choose a category." }, { status: 400 });
  const stock = Number(form?.get("stock") ?? 10);
  if (!Number.isInteger(stock) || stock < 0 || stock > 100000) {
    return NextResponse.json({ error: "Starting stock must be a whole number, 0 or more." }, { status: 400 });
  }

  let table: unknown[][];
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    if (/\.csv$/i.test(file.name)) table = parseCsv(bytes.toString("utf8"));
    else if (/\.xlsx$/i.test(file.name)) {
      const sheets = await readXlsxFile(bytes);
      table = (sheets[0]?.data ?? []) as unknown[][];
    } else {
      return NextResponse.json({ error: "Use an Excel (.xlsx) or CSV (.csv) file." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "That file couldn't be read. Re-save it as .xlsx or .csv and try again." }, { status: 400 });
  }

  const { rows, warnings } = parseTable(table, { category, stock });

  try {
    const skus = rows.flatMap((r) => (r.row?.designNo ? [`SBCM-${r.row.designNo}`.toUpperCase()] : []));
    const taken = skus.length
      ? new Set((await prisma.productVariant.findMany({ where: { sku: { in: skus } }, select: { sku: true } })).map((v) => v.sku))
      : new Set<string>();
    const existing = rows.filter((r) => r.row).map((r) => ({
      line: r.line,
      duplicate: r.row!.designNo ? taken.has(`SBCM-${r.row!.designNo}`.toUpperCase()) : false,
    }));
    const dup = new Set(existing.filter((e) => e.duplicate).map((e) => e.line));

    return NextResponse.json({
      warnings,
      rows: rows.map((r) => ({
        line: r.line,
        errors: r.errors,
        duplicate: dup.has(r.line),
        row: r.row,
      })),
    });
  } catch (error) {
    return dbErrorResponse(error);
  }
}
