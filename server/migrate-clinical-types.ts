import { db } from "./db";
import { sql } from "drizzle-orm";

async function migrate() {
  try {
    // Add clinicalTypes column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE documents 
      ADD COLUMN IF NOT EXISTS clinical_types text[] DEFAULT ARRAY[]::text[]
    `);
    console.log("✓ Added clinical_types column");

    // Backfill existing documents with their current clinicalType
    const result = await db.execute(sql`
      UPDATE documents 
      SET clinical_types = ARRAY[clinical_type]::text[]
      WHERE clinical_types IS NULL OR array_length(clinical_types, 1) IS NULL
    `);
    console.log(`✓ Backfilled ${result.rowCount} documents with clinical_types`);
    
    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
