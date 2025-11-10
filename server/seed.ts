import { db } from "./db";
import { patients } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");
  
  // Check if demo patient already exists
  const existingPatient = await db.select().from(patients).where(eq(patients.id, 1));
  
  if (existingPatient.length === 0) {
    await db.insert(patients).values({
      name: "Jane Doe",
      email: "jane.doe@example.com",
    });
    console.log("Demo patient created: Jane Doe");
  } else {
    console.log("Demo patient already exists");
  }
  
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
