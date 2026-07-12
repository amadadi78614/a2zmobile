import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isAdminLoginRoute = request.nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isAdminLoginRoute && !user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role/active-admin checks happen in the admin layout (Server Component),
  // which has full DB access — middleware only gates "is there a session at
  // all" to keep the edge check cheap. Do not treat this middleware as the
  // sole authorization boundary; every admin server action re-checks role.
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
