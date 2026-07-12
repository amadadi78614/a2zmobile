import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminRole, AdminUser } from "@/lib/types";

/**
 * Resolves the current session to an admin user, or null.
 * This queries `admin_users` directly (not a client-trusted claim), so it's
 * safe to use as the actual authorization check in Server Components and
 * Server Actions — unlike middleware.ts, which only confirms a session exists.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("admin_users")
    .select("id, full_name, role, is_active")
    .eq("id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    fullName: data.full_name,
    role: data.role as AdminRole,
    isActive: data.is_active,
  };
}

/**
 * Use at the top of every admin Server Component / Server Action that
 * requires a signed-in, active admin with one of `allowedRoles`.
 * Redirects to login (Server Component context) — Server Actions should
 * use `assertAdminRole` instead, which throws rather than redirecting.
 */
export async function requireAdmin(allowedRoles?: AdminRole[]): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");
  if (allowedRoles && !allowedRoles.includes(admin.role)) {
    redirect("/admin?error=insufficient_role");
  }
  return admin;
}

/**
 * Server Action variant — throws instead of redirecting, since Server
 * Actions can't perform a navigation redirect the same way. Callers should
 * catch and surface the error to the form.
 */
export async function assertAdminRole(allowedRoles: AdminRole[]): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Not authenticated as an admin user.");
  if (!allowedRoles.includes(admin.role)) {
    throw new Error(`Role '${admin.role}' is not permitted to perform this action.`);
  }
  return admin;
}
