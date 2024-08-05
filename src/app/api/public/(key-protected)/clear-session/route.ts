import { db } from '@/lib/db';
import { Session, SessionTemp } from '@/lib/db/schema';
import { env } from '@/lib/env.mjs';
import { logger } from '@/lib/logger';
import { lucia } from '@/lib/lucia/auth';
import rateLimit from '@/lib/rateLimit';
import { getTimeMs } from '@/lib/utils';
import { inArray } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

const limiter = rateLimit({
  uniqueTokenPerInterval: 100, // requests per interval (old request will be removed when new request comes in)
  interval: getTimeMs(1, 'hour'), // 1 hour
});

// clean db session protected with a simple API_KEY set in the environment
export async function GET(req: NextRequest) {
  try {
    await limiter.check(req.headers, 10, 'CLEAN_SESSION'); // 10 requests per minute
  } catch (error) {
    return NextResponse.json({ success: 0, message: 'Too many requests' }, { status: 429 });
  }

  const reqData = await req.json();
  // if the request does not contain the API_KEY, return an error

  if (req.headers.get('Authorization') !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ success: 0, message: 'Invalid API_KEY' }, { status: 403 });
  }

  // use lucia to delete expired sessions
  await lucia.deleteExpiredSessions();

  // search for any temporary session that has expired
  const anyExpired = await db.query.SessionTemp.findMany({
    where: (fields, { lt }) => lt(fields.expiresAt, new Date()),
  });

  if (anyExpired.length) {
    await db.delete(Session).where(
      inArray(
        Session.id,
        anyExpired.map((s) => s.sessionId)
      )
    );

    await db.delete(SessionTemp).where(
      inArray(
        SessionTemp.id,
        anyExpired.map((s) => s.id)
      )
    );
  }

  logger.info(reqData, 'Session cleaned');
  return NextResponse.json({ success: 1, message: 'Session cleaned' }, { status: 200 });
}
