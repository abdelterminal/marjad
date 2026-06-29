import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { isRedisReady } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const checkedAt = new Date().toISOString();
  const [databaseResult, redisResult] = await Promise.allSettled([
    db.execute(sql`select 1`),
    isRedisReady(),
  ]);

  const databaseOk = databaseResult.status === 'fulfilled';
  const redisOk = redisResult.status === 'fulfilled' && redisResult.value;
  const healthy = databaseOk && redisOk;

  if (databaseResult.status === 'rejected') {
    console.error('[GET /api/health] Database check failed:', databaseResult.reason);
  }

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      checks: {
        app: 'ok',
        database: databaseOk ? 'ok' : 'error',
        redis: redisOk ? 'ok' : 'error',
      },
      checkedAt,
    },
    {
      status: healthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}
