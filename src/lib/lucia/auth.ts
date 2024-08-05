import { db } from '@/lib/db/index';
import { Session } from '@/lib/db/schema/auth';
import { M_User } from '@/lib/db/schema/user';
import { isProd } from '@/lib/env.mjs';
import { DatabaseUserAttributes } from '@/lib/types';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia, TimeSpan, type Session as LuciaSession, type User as LuciaUser } from 'lucia';
import { cookies } from 'next/headers';
import { cache } from 'react';

export const adapter = new DrizzlePostgreSQLAdapter(db, Session, M_User);

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(1, 'w'),
  sessionCookie: {
    expires: true,
    attributes: {
      secure: isProd,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      // attributes has the type of DatabaseUserAttributes
      id: attributes.id,
      username: attributes.username,
      setupTwoFactor: attributes.twoFactorSecret !== null,
      role: attributes.role,
    };
  },
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

export const validateSignedIn = cache(
  async (): Promise<{ user: LuciaUser; session: LuciaSession } | { user: null; session: null }> => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    const result = await lucia.validateSession(sessionId);
    // next.js throws when you attempt to set cookie when rendering page
    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      }
    } catch {}

    return result;
  }
);
