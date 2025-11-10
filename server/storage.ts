import { 
  users,
  documents,
  type User, 
  type UpsertUser,
  type Document,
  type InsertDocument 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocuments(userId: string, documentType?: string, clinicalType?: string): Promise<Document[]>;
  getDocumentById(id: number, userId: string): Promise<Document | undefined>;
  deleteDocument(id: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Document operations
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async getDocuments(userId: string, documentType?: string, clinicalType?: string): Promise<Document[]> {
    if (documentType && clinicalType) {
      const docs = await db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.userId, userId),
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
            eq(documents.userId, userId),
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
            eq(documents.userId, userId),
            eq(documents.clinicalType, clinicalType)
          )
        )
        .orderBy(desc(documents.createdAt));
      return docs;
    } else {
      const docs = await db
        .select()
        .from(documents)
        .where(eq(documents.userId, userId))
        .orderBy(desc(documents.createdAt));
      return docs;
    }
  }

  async getDocumentById(id: number, userId: string): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)));
    return document || undefined;
  }

  async deleteDocument(id: number, userId: string): Promise<void> {
    await db.delete(documents).where(and(eq(documents.id, id), eq(documents.userId, userId)));
  }
}

export const storage = new DatabaseStorage();
