import { env } from "@/lib/env.mjs";
import { AnyColumn, sql } from "drizzle-orm";
import { PoolConfig } from "pg";

export const dbConfig: PoolConfig = {
  host: env.DB_HOST,
  user: env.DB_USER,
  port: parseInt(env.DB_PORT),
  database: env.DB_NAME,
  password: env.DB_PASS,
  ssl: { rejectUnauthorized: true, ca: env.DB_CA },
};

export const increment = (column: AnyColumn, value = 1) => {
  return sql`${column} + ${value}`;
};
