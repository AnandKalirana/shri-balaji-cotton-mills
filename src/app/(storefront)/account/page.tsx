"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: "CUSTOMER" | "ADMIN" | "STAFF";
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body =
        mode === "login"
          ? { email: form.email, password: form.password }
          : {
              fullName: form.fullName,
              email: form.email,
              password: form.password,
              ...(form.phone ? { phone: form.phone } : {}),
            };
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setUser(data.user);
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.refresh();
  }

  if (checking) return <div className="py-32 text-center text-[#867273]">Loading…</div>;

  if (user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 sm:py-24">
        <span className="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#5c1d24]">My Account</span>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl text-[#2b1e1a] mt-1 mb-2">
          Welcome, {user.fullName}
        </h1>
        <p className="text-sm text-[#534343] mb-8">{user.email}</p>
        <div className="flex flex-col gap-3">
          <Link href="/orders" className="px-6 py-4 border border-[#ebe3d5] hover:border-[#c5a880] text-sm text-[#2b1e1a] transition-colors">My Orders</Link>
          <Link href="/wishlist" className="px-6 py-4 border border-[#ebe3d5] hover:border-[#c5a880] text-sm text-[#2b1e1a] transition-colors">Wishlist</Link>
          {user.role !== "CUSTOMER" && (
            <Link href="/admin" className="px-6 py-4 border border-[#c5a880] text-sm text-[#5c1d24] font-semibold transition-colors hover:bg-[#f0ede9]">Admin Dashboard</Link>
          )}
        </div>
        <Button variant="secondary" className="mt-8" onClick={logout}>Sign out</Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl text-[#2b1e1a] mb-8">
        {mode === "login" ? "Sign in" : "Create account"}
      </h1>
      <form onSubmit={submit} className="flex flex-col gap-5">
        {mode === "register" && (
          <>
            <Input label="Full name" value={form.fullName} onChange={set("fullName")} required />
            <Input label="Phone (optional)" type="tel" value={form.phone} onChange={set("phone")} />
          </>
        )}
        <Input label="Email" type="email" value={form.email} onChange={set("email")} required />
        <Input label="Password" type="password" value={form.password} onChange={set("password")} required />
        {error && <p role="alert" className="text-sm text-[#ba1a1a]">{error}</p>}
        <Button type="submit" loading={loading} fullWidth>
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>
      <button
        type="button"
        onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
        className="mt-6 text-xs tracking-[0.12em] uppercase font-semibold text-[#5c1d24] underline"
      >
        {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
