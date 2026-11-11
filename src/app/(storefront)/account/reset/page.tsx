"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== again) return setError("The two passwords don't match.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Something went wrong. Please try again.");
      setDone(true);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-ink mb-4">Password changed</h1>
        <p className="text-sm text-muted mb-6">You can now sign in with your new password.</p>
        <Link href="/account" className="text-sm font-medium text-wine underline">Go to sign in</Link>
      </>
    );
  }
  if (!token) {
    return (
      <>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-ink mb-4">Link not valid</h1>
        <Link href="/account" className="text-sm font-medium text-wine underline">Ask for a new link</Link>
      </>
    );
  }
  return (
    <>
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl text-ink mb-8">Choose a new password</h1>
      <form onSubmit={submit} className="flex flex-col gap-5">
        <Input label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} helperText="At least 10 characters" required minLength={10} autoComplete="new-password" />
        <Input label="Type it again" type="password" value={again} onChange={(e) => setAgain(e.target.value)} required autoComplete="new-password" />
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <Button type="submit" loading={loading} fullWidth className="rounded-full">Save new password</Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
