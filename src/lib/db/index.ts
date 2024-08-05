import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';
import { dbConfig } from './utils';

const client = new Pool({ ...dbConfig, max: 30 });
export const db = drizzle(client, { schema });
