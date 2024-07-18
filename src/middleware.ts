// middleware.ts
import { CsrfError, createCsrfProtect } from "@edge-csrf/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// initalize csrf protection method
const csrfProtect = createCsrfProtect({
  cookie: {
    secure: process.env.NODE_ENV === "production",
  },
});

// Next.js middleware function
export const middleware = async (request: NextRequest) => {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-next-pathname", request.nextUrl.pathname);
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // csrf protection
  try {
    // if public api, skip csrf protection
    if (request.url.startsWith("/api/public")) return response;

    await csrfProtect(request, response);
  } catch (err) {
    if (err instanceof CsrfError) return new NextResponse("invalid csrf token", { status: 403 });
    throw err;
  }

  // return token
  if (request.nextUrl.pathname === "/csrf-token")
    return NextResponse.json({ csrfToken: response.headers.get("X-CSRF-Token") || "missing" });

  return response;
};
