import { 
  patients, 
  documents,
  type Patient, 
  type InsertPatient,
  type Document,
  type InsertDocument 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Patient operations
  getPatient(id: number): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocuments(patientId: number, documentType?: string): Promise<Document[]>;
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

  async getDocuments(patientId: number, documentType?: string): Promise<Document[]> {
    let query = db
      .select()
      .from(documents)
      .where(eq(documents.patientId, patientId));

    if (documentType) {
      query = query.where(eq(documents.documentType, documentType)) as any;
    }

    const docs = await query.orderBy(desc(documents.createdAt));
    return docs;
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
