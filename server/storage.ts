import { 
  users,
  documents,
  chatConversations,
  chatMessages,
  type User, 
  type UpsertUser,
  type Document,
  type InsertDocument,
  type ChatConversation,
  type InsertChatConversation,
  type ChatMessage,
  type InsertChatMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, arrayContains, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocuments(userId: string, documentType?: string, clinicalType?: string): Promise<Document[]>;
  getDocumentById(id: number, userId: string): Promise<Document | undefined>;
  deleteDocument(id: number, userId: string): Promise<void>;

  // Chat operations
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  getChatConversations(userId: string): Promise<ChatConversation[]>;
  updateChatConversation(id: number, data: Partial<InsertChatConversation>): Promise<void>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(conversationId: number, userId: string): Promise<ChatMessage[]>;
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
    const conditions = [eq(documents.userId, userId)];

    if (documentType) {
      conditions.push(eq(documents.documentType, documentType));
    }

    if (clinicalType) {
      conditions.push(eq(documents.clinicalType, clinicalType));
    }

    const docs = await db
      .select()
      .from(documents)
      .where(and(...conditions))
      .orderBy(desc(documents.createdAt));
    
    return docs;
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

  // Chat operations
  async createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const [newConversation] = await db
      .insert(chatConversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async getChatConversations(userId: string): Promise<ChatConversation[]> {
    const conversations = await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.userId, userId))
      .orderBy(desc(chatConversations.updatedAt));
    return conversations;
  }

  async updateChatConversation(id: number, data: Partial<InsertChatConversation>): Promise<void> {
    await db
      .update(chatConversations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(chatConversations.id, id));
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getChatMessages(conversationId: number, userId: string): Promise<ChatMessage[]> {
    const messages = await db
      .select({
        id: chatMessages.id,
        conversationId: chatMessages.conversationId,
        role: chatMessages.role,
        content: chatMessages.content,
        documentsReferenced: chatMessages.documentsReferenced,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .innerJoin(chatConversations, eq(chatMessages.conversationId, chatConversations.id))
      .where(
        and(
          eq(chatMessages.conversationId, conversationId),
          eq(chatConversations.userId, userId)
        )
      )
      .orderBy(chatMessages.createdAt);
    return messages;
  }
}

export const storage = new DatabaseStorage();
