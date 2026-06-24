import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { sql } from 'drizzle-orm';
import { db } from '@/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const checkedAt = new Date().toISOString();

  try {
    await db.execute(sql`select 1`);

    return NextResponse.json(
      {
        status: 'ok',
        checks: {
          app: 'ok',
          database: 'ok',
        },
        checkedAt,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    );
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        check: 'database',
        endpoint: 'health',
      },
      level: 'fatal',
    });
    return NextResponse.json(
      {
        status: 'degraded',
        checks: {
          app: 'ok',
          database: 'error',
        },
        checkedAt,
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    );
  }
}
