/** Small fetch helper for admin screens: returns the server's real error message on failure. */
export async function api<T = Record<string, unknown>>(
  url: string,
  init?: RequestInit & { json?: unknown }
): Promise<{ ok: true; data: T } | { ok: false; error: string; status: number }> {
  try {
    const { json, ...rest } = init ?? {};
    const res = await fetch(url, {
      ...rest,
      ...(json !== undefined
        ? { headers: { "Content-Type": "application/json", ...(rest.headers ?? {}) }, body: JSON.stringify(json) }
        : {}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, status: res.status, error: (data as { error?: string }).error || "Something went wrong. Please try again." };
    }
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, status: 0, error: "Couldn't reach the server. Check your connection and try again." };
  }
}
