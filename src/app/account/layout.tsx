import { redirect } from "next/navigation";
import { AccountNav } from "@/components/account/AccountNav";
import { createClient } from "@/lib/supabase/server";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.full_name?.trim() ||
    (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "") ||
    user.email?.split("@")[0] ||
    "Customer";
  const firstName = displayName.split(/\s+/)[0];

  return (
    <div className="container-content py-10 md:py-14">
      <div className="mb-8">
        <span className="eyebrow">My Account</span>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Welcome back, {firstName}</h1>
      </div>
      <div className="flex flex-col gap-10 lg:flex-row">
        <AccountNav />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
