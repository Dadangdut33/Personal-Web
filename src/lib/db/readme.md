# Readme

## About the database

We are using Xata to deploy our database. Xata is a database as a service that is built on top of Postgres. It supports file storage, and have generouse free tier.

We are also using drizzle as an ORM database library to manage our database access. But, because drizzle does not support the file storage feature of Xata, we use xata directly when uploading, deleting, or editing files.

You can see the usage of xata in the [upload.ts](../actions/xata/upload.ts) file.

For anyone reading this, if you want to use the same database setup, i recommend that you create the schema first in the Xata web interface. Because pushing the local schema to Xata is not supported. Xata & drizzle also supports the ability of pulling the schema from the database to the local schema (but i haven't tried it yet).

## About the schema

In order to keep tracking of data changes (metadata of created_at & updated_at), we use [Xata](https://xata.io/). That is why we have the XataMetaType added to the typing manually.

We added it manually because it won't work if we try to add the xata manually to our drizzle schema. We need to add it manually to the typing.

Example:

```typescript
const actors = pgTable('Actors', {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text('name'),
  city: text('city')
  /* actually somewhat like this
  xata: {
    created_at: XataMetaType.created_at, // managed by xata
    updated_at: XataMetaType.updated_at // managed by xata
  } */
});
```

in this example, when we input a new actor, the created_at and updated_at will be automatically added to the database. It also does the same for id. It will automatically generate a unique id for the actor.

For the sake of consistency, we define our `id` as a uuid type. This is because we want to have a unique identifier for each row in the table. In normal circumstances, the id that get inserted every time we insert a new row is a random uuid. But since we use `xata`, it is now handled by `xata` itself (not by drizzle).

Keep in mind that default value that you set in drizzle will be ignored because we are using xata. So, you must make sure to define this default value in the xata schema.

## Other schema conversion

Read [here](https://xata.io/docs/rest-api/limits#column-limits) to learn more about xata model limits.

- We use `varchar` to replace xata `string` in drizzle. Xata limits strings to 2048 characters. (Text have 200 kb limit)
- We use `string` to replace drizzle/postgres `enum` in xata. Xata does not have enum, but we can still use enum in the drizzle schema.
