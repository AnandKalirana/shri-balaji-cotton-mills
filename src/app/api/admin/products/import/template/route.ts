import { requireAdmin } from "@/lib/admin-guard";
import { TEMPLATE_CSV } from "@/lib/product-import";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  return new Response(TEMPLATE_CSV, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="product-import-template.csv"',
    },
  });
}
