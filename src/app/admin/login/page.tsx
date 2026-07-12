"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      // Confirm this account is an active admin before letting them through —
      // signing in successfully only proves it's a valid Supabase user, not
      // that they're staff. The admin layout re-checks this server-side too;
      // this is just to fail fast with a clear message.
      const { data: adminRow } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", data.user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (!adminRow) {
        await supabase.auth.signOut();
        throw new Error("This account doesn't have admin access.");
      }

      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-4">
      <div className="w-full max-w-sm bg-paper p-8 shadow-premium">
        <span className="eyebrow">A2Z Admin</span>
        <h1 className="mt-2 text-2xl font-semibold">Staff Sign In</h1>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-ink-500">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border border-line px-4 py-3 text-sm outline-none focus:border-ink"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-500">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full border border-line px-4 py-3 text-sm outline-none focus:border-ink"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-xs text-secondary">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary mt-2 disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-400">
          Staff access only. Contact the owner if you need an account.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
