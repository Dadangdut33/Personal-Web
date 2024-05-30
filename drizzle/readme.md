# Readme

The generated schema in here can be use to sync the database with the schema. For local development you can probably just use the `drizzle-kit push` command, but for xata you will need to manually insert the cleaned schema into the database. We cannot use the `drizzle-kit push` command as of now because it has limitation on the `DO` statement.

For more information about the database setup, take a look at another [readme](../src/lib/db/readme.md) in the db folder.
