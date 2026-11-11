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
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
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
    setNotice("");
    setLoading(true);
    try {
      if (mode === "forgot") {
        const r = await fetch("/api/auth/forgot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email }),
        });
        const d = await r.json();
        if (!r.ok) setError(d.error || "Something went wrong. Please try again.");
        else setNotice(d.message);
        return;
      }
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

  if (checking) return <div className="py-32 text-center text-muted">Loading…</div>;

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
        <span className="text-xs font-medium text-wine">My Account</span>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl text-ink mt-1">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-graphite mt-2 mb-8 break-all">{user.email}</p>

        <ul className="rounded-2xl bg-white border border-line/70 shadow-card overflow-hidden divide-y divide-line/70">
          {rows.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-4 px-5 py-4 min-h-[56px] text-ink hover:bg-fog active:bg-mist transition-colors"
              >
                <span className="w-9 h-9 rounded-full bg-mist text-wine flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
                <span className="flex-1 text-sm font-medium">{label}</span>
                <ChevronRight className="w-4 h-4 text-muted" />
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
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl text-ink mb-8">
        {mode === "login" ? "Sign in" : mode === "forgot" ? "Reset password" : "Create account"}
      </h1>
      <form onSubmit={submit} className="flex flex-col gap-5">
        {mode === "register" && (
          <>
            <Input label="Full name" value={form.fullName} onChange={set("fullName")} required />
            <Input label="Phone (optional)" type="tel" value={form.phone} onChange={set("phone")} />
          </>
        )}
        <Input label="Email" type="email" value={form.email} onChange={set("email")} required />
        {mode !== "forgot" && <Input label="Password" type="password" value={form.password} onChange={set("password")} required />}
        {mode === "login" && (
          <button type="button" onClick={() => { setMode("forgot"); setError(""); setNotice(""); }} className="self-start -mt-2 text-xs font-medium text-wine underline">
            Forgot password?
          </button>
        )}
        {notice && <p role="status" className="text-sm text-ink">{notice}</p>}
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <Button type="submit" loading={loading} fullWidth className="rounded-full">
          {mode === "login" ? "Sign in" : mode === "forgot" ? "Send reset link" : "Create account"}
        </Button>
      </form>
      <button
        type="button"
        onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setNotice(""); }}
        className="mt-6 text-xs font-medium text-wine underline"
      >
        {mode === "login" ? "New here? Create an account" : mode === "forgot" ? "Back to sign in" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
