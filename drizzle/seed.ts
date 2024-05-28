import * as schema from "@/lib/db/schema";
import { getXataClient } from "@/lib/db/xata";
import { drizzle } from "drizzle-orm/xata-http";
import { Argon2id } from "oslo/password";

let generatePassword = (
  length = 32,
  characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()"
) =>
  Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map((x) => characters[x % characters.length])
    .join("");

const run = async () => {
  const xata = getXataClient();
  const db = drizzle(xata, { schema });

  console.log("⏳ Seeding...");

  const start = Date.now();

  // default user admin
  const randomPass = generatePassword();
  const hashedPassword = await new Argon2id().hash(randomPass);

  const [user] = await db
    .insert(schema.M_User)
    .values({
      username: "admin",
      hashedPassword,
      role: "SUPER ADMIN",
    })
    .returning({ insertedId: schema.M_User.id });

  await db.insert(schema.M_Profile).values({
    userId: user.insertedId,
    name: "Admin",
  });

  console.log("**NOTES** ");
  console.log("Create default user admin");
  console.log("Password:", randomPass);

  const end = Date.now();

  console.log("✅ Seeding completed in", end - start, "ms");

  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Seeding failed");
  console.error(err);
  process.exit(1);
});
