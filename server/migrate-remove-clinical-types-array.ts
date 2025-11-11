import { db } from "./db";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("Starting migration to remove clinical_types array column...");
  
  try {
    // Start transaction
    await db.execute(sql`BEGIN`);
    
    // Backfill clinicalType from clinicalTypes array (use first element if exists)
    console.log("Backfilling clinical_type from clinical_types array...");
    const backfillResult = await db.execute(sql`
      UPDATE documents 
      SET clinical_type = COALESCE(
        clinical_types[1],
        clinical_type,
        'other_unclassified'
      )
      WHERE clinical_type IS NULL OR clinical_type = ''
    `);
    console.log(`✓ Backfilled ${backfillResult.rowCount} documents`);
    
    // Drop the clinical_types array column
    console.log("Dropping clinical_types column...");
    await db.execute(sql`
      ALTER TABLE documents 
      DROP COLUMN IF EXISTS clinical_types
    `);
    console.log("✓ Dropped clinical_types column");
    
    // Commit transaction
    await db.execute(sql`COMMIT`);
    
    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    // Rollback on error
    await db.execute(sql`ROLLBACK`);
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
