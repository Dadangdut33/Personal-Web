# Readme

## About the database

We are using Xata to deploy our database. Xata is a database as a service that is built on top of Postgres. It supports file storage, and have generous free tier.

We are also using drizzle as an ORM database library to manage our database access. But, because drizzle does not support the file storage feature of Xata, we use xata directly when uploading, deleting, or editing files.

You can see the usage of xata in the [upload.ts](../actions/xata/upload.ts) file.

As of now, we are using the beta version of postgres in xata. It supports using drizzle to manage the database schema, but there is a bug that makes it not possible to sync the schema to the xata database because of the `DO` statement. So, we need to manually insert the schema into the xata database. To make it easier, we have a script that will clean the schema and make it ready to be inserted into the xata database located in the [clean-schema.ts](../../../scripts/clean-sql.ts) file.

## About the schema

In order to keep tracking of data changes (metadata of created_at & updated_at), we use [Xata](https://xata.io/).

This column is automatically managed by xata, that is why we have the XataMetaType & BASE_XATA_RETURN to be added to the types and query.

Example:

```typescript
const actors = pgTable('Actors', {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text('name'),
  city: text('city')
  /* actually there is field like this managed by xata
  xata_id: ... ,
  xata_createdat: ...,
  xata_updatedat: ...,
  xata_version: ...
  */
});
```

in this example, when we input a new actor, the created_at and updated_at will be automatically added to the database. It also does the same for xata_id. It will automatically generate a unique xata_id for the actor.

Xata generates its own unique and sortable id for each row in the database. But we use our own id because it can be defined in the schema, which makes it easier to be used in the code.

### Schema in the schema/xata folder

The schema in this folder should be treated differently, you will need to modify some stuff after syncing the schema.

The `file` column in the `file` model should be deleted and then re-added into a file column in the xata web interface.
