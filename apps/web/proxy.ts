import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  SIGNED_IN_URL,
  SIGN_IN_URL,
} from "@/feature/auth/constants";

// Routes an unauthenticated visitor is allowed to reach without being
// bounced to sign-in. Everything else requires authentication.
const publicRoutes = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/sso-callback",
];

// Routes an already-authenticated user should be redirected away from and back
// into the app home: the auth entry points, the marketing root ("/"), and the
// bare dashboard path ("/dashboard", which is only a route group, not a page).
const signedInRedirectRoutes = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/",
  "/dashboard",
];

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export default clerkMiddleware(async (auth, request) => {
  const { isAuthenticated } = await auth();
  const { pathname } = request.nextUrl;

  if (isAuthenticated) {
    if (matchesRoute(pathname, signedInRedirectRoutes)) {
      return NextResponse.redirect(new URL(SIGNED_IN_URL, request.url));
    }

    return NextResponse.next();
  }

  // Unauthenticated: allow public routes through, redirect everything else to
  // sign-in. Excluding the auth routes here is what prevents the infinite
  // redirect loop (sign-in -> sign-in -> ...).
  if (!matchesRoute(pathname, publicRoutes)) {
    return NextResponse.redirect(new URL(SIGN_IN_URL, request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Always run for Clerk-specific frontend API routes
    "/__clerk/(.*)",
  ],
};
