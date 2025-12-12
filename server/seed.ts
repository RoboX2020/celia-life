import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Check if demo patient already exists
  const existingUser = await db.select().from(users).where(eq(users.email, "jane.doe@example.com"));

  if (existingUser.length === 0) {
    await db.insert(users).values({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
    });
    console.log("Demo user created: Jane Doe");
  } else {
    console.log("Demo user already exists");
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
