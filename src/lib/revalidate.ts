import { revalidatePath } from "next/cache";

/** Refresh every cached storefront page after the admin changes content. */
export function revalidateStore() {
  try {
    revalidatePath("/", "layout");
  } catch {
    // Not running inside a Next request (for example in a script) — nothing to refresh.
  }
}
