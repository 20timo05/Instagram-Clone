import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const onlyLoggedOut = [
  "/auth/login",
  "/auth/signup",
  "/auth/reset",
  "/api/auth/signup",
  "/api/two_factor_auth",
];

// all routes that do not start with this should only be accessed by logged in users, e.x.: /[username]
const allRoutesNotOnlyLoggedIn = [
  "/auth",
  "/api",
  "/_next",
  "/favicon",
  "/icons",
];

const adminRoutes = ["/api/faker", "/admin"];
const admins = ["trollfi"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isRouteOnlyForLoggedOut = !!onlyLoggedOut.find((route) =>
    pathname.startsWith(route)
  );
  const isRouteOnlyForLoggedIn = !allRoutesNotOnlyLoggedIn.find((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = !!adminRoutes.find((route) =>
    pathname.startsWith(route)
  );

  /* console.log(`
  -----------------------------------------------------
  ${pathname}
  ${session ? session.name : false}
    isRouteOnlyForLoggedOut: ${isRouteOnlyForLoggedOut}
    isRouteOnlyForLoggedIn: ${isRouteOnlyForLoggedIn}
    isAdminRoute: ${isAdminRoute}
  `); */

  if (isRouteOnlyForLoggedOut && session)
    return unauthorized(pathname, req.url, "/");
  if (isRouteOnlyForLoggedIn && !session)
    return unauthorized(pathname, req.url, "/auth/login");

  if (isAdminRoute && (!session || !admins.includes(session.name)))
    return unauthorized(pathname, req.url, "/");
  return NextResponse.next();
}

function unauthorized(pathname, url, redirect) {
  console.log("unauthorized", pathname, "redirect: " + redirect);
  if (pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/api/unauthorized", url));
  }
  return NextResponse.redirect(new URL(redirect, url));
}
