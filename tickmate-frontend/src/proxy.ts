import { NextRequest, NextResponse } from "next/server";

const AUTH_PREFIX = "/auth";
const USER_DASHBOARD = "/dashboard/user";
const SIGNIN_ROUTE = "/auth/signin";

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check token from cookies (adjust names if your app uses a specific one)
  const token = request.cookies.get("token")?.value;

  // Root route: always redirect by auth state
  if (token && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = USER_DASHBOARD;
    return NextResponse.redirect(url);
  }

  if (token && pathname === SIGNIN_ROUTE) {
    const url = request.nextUrl.clone();
    url.pathname = USER_DASHBOARD;
    return NextResponse.redirect(url);
  }

  // Skip auth routes completely
  if (pathname.startsWith(AUTH_PREFIX)) {
    return NextResponse.next();
  }

  // Protect all other matched routes
  if (!token && pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = SIGNIN_ROUTE;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all app routes except API/static files
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
