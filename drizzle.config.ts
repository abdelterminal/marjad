import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({
  path:
    process.env.NODE_ENV === 'production'
      ? ['.env.production', '.env']
      : ['.env.local', '.env'],
});

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
