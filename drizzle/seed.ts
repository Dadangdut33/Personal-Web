import { seedUser } from "./scripts/seedUser";

seedUser("admin")
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seeding failed");
    console.error(err);
    process.exit(1);
  });
