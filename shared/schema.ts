import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document type enum
export const documentTypeEnum = z.enum([
  "lab_report",
  "medical_image", 
  "doctor_note",
  "prescription",
  "other"
]);

export type DocumentType = z.infer<typeof documentTypeEnum>;

// Clinical type enum
export const clinicalTypeEnum = z.enum([
  "general_primary_care",
  "cardiology",
  "endocrinology",
  "neurology",
  "dermatology",
  "dentistry",
  "gynecology",
  "psychiatry",
  "other_unclassified"
]);

export type ClinicalType = z.infer<typeof clinicalTypeEnum>;

// Document table
export const documents = pgTable("documents", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  originalFileName: text("original_file_name").notNull(),
  storedFilePath: text("stored_file_path").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  documentType: text("document_type").notNull(),
  clinicalType: text("clinical_type").notNull().default("other_unclassified"),
  title: text("title").notNull(),
  source: text("source"),
  dateOfService: timestamp("date_of_service"),
  shortSummary: text("short_summary").notNull(),
  extractedText: text("extracted_text"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Chat conversations table
export const chatConversations = pgTable("chat_conversations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull().default("New Conversation"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  conversationId: integer("conversation_id").notNull().references(() => chatConversations.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  documentsReferenced: integer("documents_referenced").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas for chat
export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
