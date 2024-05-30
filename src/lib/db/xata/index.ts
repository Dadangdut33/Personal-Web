import { env } from "@/lib/env.mjs";
import { BaseClientOptions, buildClient } from "@xata.io/client";

import { DatabaseSchema, tables } from "./autogenerated";

const DatabaseClient = buildClient();

export class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions) {
    super({ ...options }, tables);
  }
}

let instance: XataClient | undefined = undefined;

export const getXataClient = () => {
  if (instance) return instance;

  instance = new XataClient({
    databaseURL: env.DATABASE_URL,
    apiKey: env.XATA_API_KEY,
    branch: env.XATA_BRANCH,
  });

  return instance;
};