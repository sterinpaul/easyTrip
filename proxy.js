import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";

export default async function proxy(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  const user = token ? await verifySession(token) : null;
  const isLoggedIn = !!user;

  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/login";

  // Redirect logged-in users away from the login page
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Redirect unauthenticated users to the login page
  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
