"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProfileForm = {
  fullName: string;
  email: string;
  phone: string;
};

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>({ fullName: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwords, setPasswords] = useState({ password: "", confirm: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (!active) return;
      if (userError || !user) {
        setError(userError?.message || "Unable to load your account.");
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;
      setForm({
        fullName: profile?.full_name || user.user_metadata?.full_name || "",
        email: user.email || "",
        phone: profile?.phone || "",
      });
      setLoading(false);
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setError(userError?.message || "Your session has expired. Please sign in again.");
      setSaving(false);
      return;
    }

    const fullName = form.fullName.trim();
    const phone = form.phone.trim();

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ id: user.id, email: user.email, full_name: fullName, phone }, { onConflict: "id" });

    if (!profileError) {
      await supabase.auth.updateUser({ data: { full_name: fullName } });
      setMessage("Profile updated successfully.");
    } else {
      setError(profileError.message);
    }

    setSaving(false);
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (passwords.password.length < 8) {
      setError("Your new password must be at least 8 characters.");
      return;
    }
    if (passwords.password !== passwords.confirm) {
      setError("The passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    const supabase = createClient();
    const { error: passwordError } = await supabase.auth.updateUser({ password: passwords.password });

    if (passwordError) setError(passwordError.message);
    else {
      setPasswords({ password: "", confirm: "" });
      setMessage("Password updated successfully.");
    }
    setPasswordSaving(false);
  }

  if (loading) return <p className="text-sm text-ink-400">Loading your profile...</p>;

  return (
    <div className="flex flex-col gap-12">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide">Profile</h2>
        <form className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={saveProfile}>
          <div>
            <label className="text-xs font-medium text-ink-500">Full name</label>
            <input value={form.fullName} onChange={(e) => setForm((current) => ({ ...current, fullName: e.target.value }))} className="mt-2 w-full border border-line px-4 py-2.5 text-sm outline-none focus:border-ink" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-500">Email</label>
            <input type="email" value={form.email} readOnly className="mt-2 w-full border border-line bg-mist px-4 py-2.5 text-sm text-ink-400 outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-500">Phone</label>
            <input value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} className="mt-2 w-full border border-line px-4 py-2.5 text-sm outline-none focus:border-ink" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </form>
      </div>

      <div className="border-t border-line pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide">Change Password</h2>
        <form className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={updatePassword}>
          <input type="password" minLength={8} required placeholder="New password" value={passwords.password} onChange={(e) => setPasswords((current) => ({ ...current, password: e.target.value }))} className="border border-line px-4 py-2.5 text-sm outline-none focus:border-ink" />
          <input type="password" minLength={8} required placeholder="Confirm new password" value={passwords.confirm} onChange={(e) => setPasswords((current) => ({ ...current, confirm: e.target.value }))} className="border border-line px-4 py-2.5 text-sm outline-none focus:border-ink" />
          <div className="sm:col-span-2">
            <button type="submit" disabled={passwordSaving} className="btn-secondary disabled:opacity-50">{passwordSaving ? "Updating..." : "Update Password"}</button>
          </div>
        </form>
      </div>

      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-secondary">{error}</p>}
    </div>
  );
}
