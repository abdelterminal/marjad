import { access, constants, mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import dotenv from 'dotenv';
import pg from 'pg';
import { createClient } from 'redis';

const { Pool } = pg;
const projectRoot = process.cwd();
const envFile =
  process.env.DEPLOY_ENV_FILE ??
  (process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local');
const envPaths =
  process.env.NODE_ENV === 'production' || envFile !== '.env.local'
    ? [path.join(projectRoot, envFile), path.join(projectRoot, '.env')]
    : [path.join(projectRoot, '.env.local'), path.join(projectRoot, '.env')];

dotenv.config({
  path: envPaths,
  quiet: true,
});

const environment = process.env.APP_ENV ?? process.env.NODE_ENV ?? 'development';
const verifyURL = process.env.DEPLOY_VERIFY_URL?.trim();
const runFullQA = process.env.DEPLOY_RUN_FULL_QA === 'true';
const failures = [];
const warnings = [];

function pass(message) {
  console.log(`[deploy-check] PASS ${message}`);
}

function fail(message) {
  failures.push(message);
  console.error(`[deploy-check] FAIL ${message}`);
}

function warn(message) {
  warnings.push(message);
  console.warn(`[deploy-check] WARN ${message}`);
}

function configured(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    fail(`${name} is missing.`);
    return null;
  }
  return value;
}

function validateEnvironment() {
  console.log(`[deploy-check] environment=${environment} envFile=${envFile}`);

  const databaseURL = configured('DATABASE_URL');
  const authSecret = configured('AUTH_SECRET');
  const authURL = configured('AUTH_URL');
  const redisURL = configured('REDIS_URL');
  const siteURL = configured('NEXT_PUBLIC_SITE_URL');
  const whatsapp = configured('NEXT_PUBLIC_WHATSAPP_NUMBER');

  if (authSecret) {
    if (
      authSecret.length < 32 ||
      /your-random-secret|change-me|change-this|placeholder|secret-here|replace-with/i.test(authSecret)
    ) {
      fail('AUTH_SECRET must be a non-placeholder value of at least 32 characters.');
    } else {
      pass('AUTH_SECRET has acceptable length and is not a known placeholder.');
    }
  }

  for (const [name, value] of [
    ['AUTH_URL', authURL],
    ['NEXT_PUBLIC_SITE_URL', siteURL],
  ]) {
    if (!value) continue;
    try {
      const parsed = new URL(value);
      const local = ['localhost', '127.0.0.1'].includes(parsed.hostname);
      if (environment === 'production' && parsed.protocol !== 'https:') {
        fail(`${name} must use HTTPS in production.`);
      } else if (!local && parsed.protocol !== 'https:') {
        warn(`${name} does not use HTTPS.`);
      } else {
        pass(`${name} is a valid URL.`);
      }
    } catch {
      fail(`${name} is not a valid URL.`);
    }
  }

  if (authURL && siteURL && authURL.replace(/\/$/, '') !== siteURL.replace(/\/$/, '')) {
    fail('AUTH_URL and NEXT_PUBLIC_SITE_URL must use the same canonical origin.');
  }

  if (whatsapp) {
    if (!/^212[67]\d{8}$/.test(whatsapp)) {
      fail('NEXT_PUBLIC_WHATSAPP_NUMBER must use Moroccan international format without +.');
    } else {
      pass('NEXT_PUBLIC_WHATSAPP_NUMBER format is valid.');
    }
  }

  return { databaseURL, redisURL };
}

async function validateDatabase(databaseURL) {
  if (!databaseURL) return;

  const pool = new Pool({
    connectionString: databaseURL,
    connectionTimeoutMillis: 3_000,
    max: 1,
  });

  try {
    await pool.query('SELECT 1');
    pass('PostgreSQL connection succeeded.');

    const requiredTables = ['users', 'categories', 'products', 'orders', 'order_items'];
    const result = await pool.query(
      `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = ANY($1::text[])
      `,
      [requiredTables],
    );
    const existing = new Set(result.rows.map((row) => row.table_name));
    const missing = requiredTables.filter((table) => !existing.has(table));
    if (missing.length > 0) {
      fail(`Database schema is missing tables: ${missing.join(', ')}.`);
    } else {
      pass('Required database tables exist.');
    }
  } catch (error) {
    fail(`PostgreSQL check failed: ${error instanceof Error ? error.message : error}`);
  } finally {
    await pool.end();
  }
}

async function validateRedis(redisURL) {
  if (!redisURL) return;

  const client = createClient({
    url: redisURL,
    socket: {
      connectTimeout: 3_000,
      reconnectStrategy: false,
    },
  });
  client.on('error', () => undefined);

  try {
    await client.connect();
    const response = await client.ping();
    if (response !== 'PONG') throw new Error(`Unexpected PING response: ${response}`);
    pass('Redis connection succeeded.');
  } catch (error) {
    fail(`Redis check failed: ${error instanceof Error ? error.message : error}`);
  } finally {
    if (client.isOpen) await client.quit().catch(() => undefined);
  }
}

async function validateFilesystemAndConfig() {
  const uploadsDir = path.join(projectRoot, 'public', 'uploads');
  const probe = path.join(uploadsDir, `.deploy-check-${Date.now()}`);

  try {
    await mkdir(uploadsDir, { recursive: true });
    await access(uploadsDir, constants.R_OK | constants.W_OK);
    await writeFile(probe, 'ok', { flag: 'wx' });
    await unlink(probe);
    pass('public/uploads exists and is writable.');
  } catch (error) {
    fail(`Upload storage is not writable: ${error instanceof Error ? error.message : error}`);
  }

  try {
    await access(path.join(projectRoot, '.next', 'BUILD_ID'), constants.R_OK);
    pass('Production build output exists.');
  } catch {
    fail('Production build output is missing; run npm run build.');
  }

  const nginxPath = path.join(projectRoot, 'nginx', 'marjad.conf');
  const pm2Path = path.join(projectRoot, 'ecosystem.config.js');

  try {
    const nginx = await readFile(nginxPath, 'utf8');
    const requiredNginxSnippets = [
      'alias /var/www/marjad/public/uploads/',
      'proxy_set_header X-Real-IP $remote_addr',
      'proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for',
      'client_max_body_size 10m',
    ];
    const missing = requiredNginxSnippets.filter((snippet) => !nginx.includes(snippet));
    if (missing.length > 0) {
      fail(`Nginx config is missing required settings: ${missing.join('; ')}`);
    } else {
      pass('Nginx proxy and upload settings match the application.');
    }
  } catch (error) {
    fail(`Could not read Nginx config: ${error instanceof Error ? error.message : error}`);
  }

  try {
    const pm2 = await readFile(pm2Path, 'utf8');
    if (
      !pm2.includes("cwd: '/var/www/marjad'") ||
      !pm2.includes("NODE_ENV: 'production'") ||
      !pm2.includes('max_memory_restart')
    ) {
      fail('PM2 config is missing cwd, production mode, or memory restart protection.');
    } else {
      pass('PM2 config contains the required runtime protections.');
    }
  } catch (error) {
    fail(`Could not read PM2 config: ${error instanceof Error ? error.message : error}`);
  }
}

async function validateLiveDeployment() {
  if (!verifyURL) {
    warn('DEPLOY_VERIFY_URL is not set; live HTTP checks were skipped.');
    return;
  }

  let base;
  try {
    base = new URL(verifyURL);
  } catch {
    fail('DEPLOY_VERIFY_URL is invalid.');
    return;
  }

  try {
    const response = await fetch(new URL('/api/health', base), {
      headers: { accept: 'application/json' },
      redirect: 'manual',
      signal: AbortSignal.timeout(10_000),
    });
    const body = await response.json().catch(() => null);
    if (response.status !== 200 || body?.status !== 'ok') {
      fail(`Live health check returned HTTP ${response.status}.`);
    } else {
      pass('Live health endpoint reports app and database healthy.');
    }
    const cacheControl = response.headers.get('cache-control') ?? '';
    if (!cacheControl.includes('no-store')) {
      fail('Health endpoint is missing no-store cache protection.');
    } else {
      pass('Health endpoint is not cacheable.');
    }
  } catch (error) {
    fail(`Live health request failed: ${error instanceof Error ? error.message : error}`);
  }

  try {
    const response = await fetch(new URL('/api/admin/dashboard', base), {
      headers: { accept: 'application/json' },
      redirect: 'manual',
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status !== 403) {
      fail(`Anonymous admin API expected JSON 403, got HTTP ${response.status}.`);
    } else if (!(response.headers.get('content-type') ?? '').includes('application/json')) {
      fail('Anonymous admin API denial is not JSON.');
    } else {
      pass('Anonymous admin API returns JSON 403.');
    }
  } catch (error) {
    fail(`Admin API contract check failed: ${error instanceof Error ? error.message : error}`);
  }
}

function runCommand(command, args, extraEnv) {
  return new Promise((resolve, reject) => {
    const executable =
      process.platform === 'win32' && command === 'npm' ? 'npm.cmd' : command;
    const child = spawn(executable, args, {
      cwd: projectRoot,
      env: { ...process.env, ...extraEnv },
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with ${code}`));
    });
  });
}

async function runOptionalQA() {
  if (!runFullQA) return;
  if (!verifyURL) {
    fail('DEPLOY_RUN_FULL_QA requires DEPLOY_VERIFY_URL.');
    return;
  }
  if (environment === 'production') {
    fail('Full QA is blocked in production because it creates temporary orders and users.');
    return;
  }

  const common = {
    PLAYWRIGHT_BASE_URL: verifyURL,
    LOAD_BASE_URL: verifyURL,
    ADMIN_QA_BASE_URL: verifyURL,
  };

  for (const script of ['test:smoke', 'test:concurrency', 'test:load', 'test:admin']) {
    console.log(`[deploy-check] running npm run ${script}`);
    try {
      await runCommand('npm', ['run', script], common);
      pass(`${script} passed.`);
    } catch (error) {
      fail(`${script} failed: ${error instanceof Error ? error.message : error}`);
      break;
    }
  }
}

async function main() {
  const { databaseURL, redisURL } = validateEnvironment();
  await validateDatabase(databaseURL);
  await validateRedis(redisURL);
  await validateFilesystemAndConfig();
  await validateLiveDeployment();
  await runOptionalQA();

  console.log(
    `[deploy-check] summary failures=${failures.length} warnings=${warnings.length}`,
  );
  if (failures.length > 0) process.exitCode = 1;
}

await main();
