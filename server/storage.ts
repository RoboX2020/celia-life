import { 
  patients, 
  documents,
  type Patient, 
  type InsertPatient,
  type Document,
  type InsertDocument 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Patient operations
  getPatient(id: number): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocuments(patientId: number, documentType?: string, clinicalType?: string): Promise<Document[]>;
  getDocumentById(id: number): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db
      .insert(patients)
      .values(insertPatient)
      .returning();
    return patient;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async getDocuments(patientId: number, documentType?: string, clinicalType?: string): Promise<Document[]> {
    if (documentType && clinicalType) {
      const docs = await db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.patientId, patientId),
            eq(documents.documentType, documentType),
            eq(documents.clinicalType, clinicalType)
          )
        )
        .orderBy(desc(documents.createdAt));
      return docs;
    } else if (documentType) {
      const docs = await db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.patientId, patientId),
            eq(documents.documentType, documentType)
          )
        )
        .orderBy(desc(documents.createdAt));
      return docs;
    } else if (clinicalType) {
      const docs = await db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.patientId, patientId),
            eq(documents.clinicalType, clinicalType)
          )
        )
        .orderBy(desc(documents.createdAt));
      return docs;
    } else {
      const docs = await db
        .select()
        .from(documents)
        .where(eq(documents.patientId, patientId))
        .orderBy(desc(documents.createdAt));
      return docs;
    }
  }

  async getDocumentById(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }
}

export const storage = new DatabaseStorage();
