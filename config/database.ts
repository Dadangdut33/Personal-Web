import env from '#start/env'

import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: env.get('DB_CONNECTION'),
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        connectionString: env.get('DB_POSTGRES_URL') ?? '', // e.g
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
    turso: {
      client: 'libsql',
      connection: {
        filename: env.get('DB_TURSO_URL') ?? '', // e.g.: https://mydb-myusername.aws-eu-west-3.turso.io?authToken=12345
      },
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
  prettyPrintDebugQueries: true,
})

export default dbConfig
