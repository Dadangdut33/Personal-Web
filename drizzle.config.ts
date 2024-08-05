import { dbConfig } from '@/lib/db/utils';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema',
  out: './drizzle/generated',
  dialect: 'postgresql',
  dbCredentials: dbConfig as any, // it match but the type is not compatible
  verbose: true,
});
