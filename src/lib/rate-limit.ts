import { createHash } from 'node:crypto';
import { createClient } from 'redis';
import { NextResponse } from 'next/server';

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RedisClient = ReturnType<typeof createClient>;

type RedisRateLimitState = {
  client: RedisClient | null;
  connectPromise: Promise<RedisClient | null> | null;
  unavailableUntil: number;
  warnedAboutFallback: boolean;
};

const buckets = new Map<string, Bucket>();
const REDIS_RETRY_DELAY_MS = 5_000;

const redisState: RedisRateLimitState =
  (globalThis as typeof globalThis & { marjadRateLimitRedis?: RedisRateLimitState })
    .marjadRateLimitRedis ?? {
    client: null,
    connectPromise: null,
    unavailableUntil: 0,
    warnedAboutFallback: false,
  };

(globalThis as typeof globalThis & { marjadRateLimitRedis?: RedisRateLimitState })
  .marjadRateLimitRedis = redisState;

const fixedWindowScript = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
return { count, ttl }
`;

function getClientIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    forwarded ||
    'unknown'
  );
}

function getBucketKey(req: Request, key: string) {
  const clientHash = createHash('sha256').update(getClientIp(req)).digest('hex').slice(0, 32);
  return `marjad:rate-limit:${key}:${clientHash}`;
}

function createLimitedResponse(retryAfterMs: number) {
  return NextResponse.json(
    { error: 'Trop de tentatives. Veuillez réessayer plus tard.' },
    {
      status: 429,
      headers: {
        'Cache-Control': 'no-store',
        'Retry-After': String(Math.max(1, Math.ceil(retryAfterMs / 1000))),
      },
    },
  );
}

async function getRedisClient() {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (!redisUrl || Date.now() < redisState.unavailableUntil) return null;

  if (redisState.client?.isReady) return redisState.client;
  if (redisState.connectPromise) return redisState.connectPromise;

  const client = createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 1_500,
      reconnectStrategy: false,
    },
  });

  client.on('error', (error) => {
    console.error('[rate-limit] Redis client error:', error);
  });

  redisState.connectPromise = client
    .connect()
    .then(() => {
      redisState.client = client;
      redisState.unavailableUntil = 0;
      return client;
    })
    .catch(async (error) => {
      console.error('[rate-limit] Redis unavailable; using local fallback:', error);
      redisState.client = null;
      redisState.unavailableUntil = Date.now() + REDIS_RETRY_DELAY_MS;
      if (client.isOpen) await client.disconnect().catch(() => undefined);
      return null;
    })
    .finally(() => {
      redisState.connectPromise = null;
    });

  return redisState.connectPromise;
}

async function checkRedisRateLimit(
  bucketKey: string,
  { limit, windowMs }: RateLimitOptions,
) {
  const client = await getRedisClient();
  if (!client) return undefined;

  try {
    const result = (await client.eval(fixedWindowScript, {
      keys: [bucketKey],
      arguments: [String(windowMs)],
    })) as [number, number];
    const [count, ttl] = result;

    return count > limit ? createLimitedResponse(ttl > 0 ? ttl : windowMs) : null;
  } catch (error) {
    console.error('[rate-limit] Redis command failed; using local fallback:', error);
    redisState.unavailableUntil = Date.now() + REDIS_RETRY_DELAY_MS;
    return undefined;
  }
}

function checkLocalRateLimit(
  bucketKey: string,
  { limit, windowMs }: RateLimitOptions,
) {
  const now = Date.now();

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }

  const existing = buckets.get(bucketKey);
  if (!existing) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return null;
  }

  existing.count += 1;
  return existing.count > limit
    ? createLimitedResponse(existing.resetAt - now)
    : null;
}

export async function checkRateLimit(
  req: Request,
  options: RateLimitOptions,
) {
  const bucketKey = getBucketKey(req, options.key);
  const redisResult = await checkRedisRateLimit(bucketKey, options);
  if (redisResult !== undefined) return redisResult;

  if (process.env.NODE_ENV === 'production' && !redisState.warnedAboutFallback) {
    console.warn(
      '[rate-limit] REDIS_URL is missing or unavailable; limits are local to this process.',
    );
    redisState.warnedAboutFallback = true;
  }

  return checkLocalRateLimit(bucketKey, options);
}
