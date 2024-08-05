import { RoleType } from '@/lib/db/schema/_enum';
import { AuthSession } from '@/lib/types';
import { Cookie } from 'lucia';
import { cookies, headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { validateSignedIn } from './auth';
import { roleIsAdmin, roleIsEditor, roleIsSuperAdmin } from './rolechecker';

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

export const setAuthCookie = (cookie: Cookie) => {
  // cookies().set(cookie.name, cookie.value, cookie.attributes); // <- suggested approach from the docs, but does not work with `next build` locally
  cookies().set(cookie);
};

// --------------------------
// Logged in -> redirect to dashboard
export const isLoggedIn = async (doRedirect = true) => {
  const { session, user } = await validateSignedIn();
  if (session && doRedirect) redirect('/dashboard');
  return { session, user };
};

// --------------------------
// Not Logged in -> redirect to auth
const checkRole = async (roleCheckFn: (role: RoleType[]) => boolean = () => true, doRedirect = true) => {
  const source = headers().get('x-next-pathname');
  const { session, user } = await validateSignedIn();

  if (!session && doRedirect) {
    redirect('/auth?redirect=' + encodeURIComponent(source || '/dashboard'));
  }

  if (user && !roleCheckFn(user.role)) {
    notFound();
  }

  return { session, user };
};

export const checkAuth = async () => {
  return await checkRole(); // no role check, only check if user is logged in
};

export const isSuperAdmin = async (doRedirect = true) => {
  return await checkRole(roleIsSuperAdmin, doRedirect);
};

export const isAdmin = async (doRedirect = true) => {
  return await checkRole(roleIsAdmin, doRedirect);
};

export const isEditor = async (doRedirect = true) => {
  return await checkRole(roleIsEditor, doRedirect);
};
