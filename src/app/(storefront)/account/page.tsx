"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Package, Heart, LayoutDashboard } from "lucide-react";
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
    const firstName = user.fullName.split(" ")[0];
    const rows = [
      { href: "/orders", label: "My Orders", icon: Package },
      { href: "/wishlist", label: "Wishlist", icon: Heart },
      ...(user.role !== "CUSTOMER"
        ? [{ href: "/admin", label: "Admin Dashboard", icon: LayoutDashboard }]
        : []),
    ];
    return (
      <div className="max-w-xl mx-auto px-4 py-16 sm:py-24">
        <span className="text-xs font-medium text-[#5c1d24]">My Account</span>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl text-[#2b1e1a] mt-1">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-[#534343] mt-2 mb-8 break-all">{user.email}</p>

        <ul className="rounded-2xl bg-white border border-[#ebe3d5]/70 shadow-[0_1px_2px_rgba(43,30,26,0.04)] overflow-hidden divide-y divide-[#ebe3d5]/70">
          {rows.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-4 px-5 py-4 min-h-[56px] text-[#2b1e1a] hover:bg-[#f6f3ee] active:bg-[#f0ede9] transition-colors"
              >
                <span className="w-9 h-9 rounded-full bg-[#f0ede9] text-[#5c1d24] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
                <span className="flex-1 text-sm font-medium">{label}</span>
                <ChevronRight className="w-4 h-4 text-[#867273]" />
              </Link>
            </li>
          ))}
        </ul>

        <Button variant="secondary" className="mt-8 rounded-full" onClick={logout}>Sign out</Button>
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
        <Button type="submit" loading={loading} fullWidth className="rounded-full">
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>
      <button
        type="button"
        onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
        className="mt-6 text-xs font-medium text-[#5c1d24] underline"
      >
        {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
