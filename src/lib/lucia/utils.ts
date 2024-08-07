import { AuthSession } from "@/lib/types";
import { Cookie } from "lucia";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { validateSignedIn } from "./auth";

export const allowedAdminRoles = ["SUPER_ADMIN", "ADMIN"];
export const roleIsSuperAdmin = (role: string[]) => role.includes("SUPER_ADMIN");
export const roleIsAdmin = (role: string[]) => role.some((r) => allowedAdminRoles.includes(r));

// mendapatkan informasi user yang sedang login
export const getUserAuth = async (): Promise<AuthSession> => {
  const { session, user } = await validateSignedIn();
  if (!session) return { session: null };
  return {
    session: {
      user: {
        id: user.id,
        username: user.username,
        setupTwoFactor: user.setupTwoFactor,
        role: user.role,
      },
    },
  };
};

export const checkAuth = async () => {
  const source = headers().get("x-next-pathname");
  const { session, user } = await validateSignedIn();
  if (!session) redirect("/auth?redirect=" + encodeURIComponent(source || "/dashboard"));
  return { session, user };
};

export const isLoggedIn = async (doRedirect = true) => {
  const { session, user } = await validateSignedIn();
  if (session && doRedirect) redirect("/dashboard");
  return { session, user };
};

export const isSuperAdmin = async (doRedirect = true) => {
  const { session, user } = await validateSignedIn();
  if (!session && doRedirect) redirect("/auth");
  if (user && !roleIsSuperAdmin(user.role)) notFound();
  return { session, user };
};

export const isAdmin = async (doRedirect = true) => {
  const { session, user } = await validateSignedIn();
  if (!session && doRedirect) redirect("/auth");
  if (user && !roleIsAdmin(user.role)) notFound();
  return { session, user };
};

export const setAuthCookie = (cookie: Cookie) => {
  // cookies().set(cookie.name, cookie.value, cookie.attributes); // <- suggested approach from the docs, but does not work with `next build` locally
  cookies().set(cookie);
};
