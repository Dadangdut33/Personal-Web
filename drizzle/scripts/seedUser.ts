import * as schema from "@/lib/db/schema";
import { dbConfig } from "@/lib/db/utils";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Argon2id } from "oslo/password";
import { Pool } from "pg";

export const generatePassword = (
  length = 32,
  characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()"
) =>
  Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map((x) => characters[x % characters.length])
    .join("");

export const seedUser = async (username: string, test = false) => {
  const client = new Pool({ ...dbConfig, max: 1 });
  const db = drizzle(client, { schema });

  console.log("⏳ Seeding...");

  const start = Date.now();

  // default user admin
  const randomPass = generatePassword();
  const hashedPassword = await new Argon2id().hash(randomPass);

  const [user] = await db
    .insert(schema.M_User)
    .values({
      username,
      hashedPassword,
      role: ["super_admin"],
    })
    .returning({ insertedId: schema.M_User.id });

  await db.insert(schema.M_Profile).values({
    userId: user.insertedId,
    name: username,
  });

  console.log("**NOTES**");
  console.log(`Created user ${username}`);
  console.log(`Password: ${randomPass}`);

  const end = Date.now();

  console.log("✅ Seeding completed in", end - start, "ms");

  if (test) {
    // delete user made
    console.log("Deleting user that was added for testing");
    await db.delete(schema.M_User).where(eq(schema.M_User.id, user.insertedId));
    console.log("Deleted user that was added for testing");
  }
};
