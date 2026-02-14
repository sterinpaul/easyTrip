import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname === "/";
  
  if (isOnDashboard) {
    if (isLoggedIn) return null;
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  } else if (isLoggedIn) {
    // Redirect logged-in users away from login page to dashboard
    if (req.nextUrl.pathname === "/login") {
        return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }
  return null;
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
