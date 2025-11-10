import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from "multer";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";
import { processUploadedFile } from "./documentProcessor";
import { extractTextFromDocument } from "./ocrService";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure uploads directory exists
async function ensureUploadsDir() {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      await ensureUploadsDir();
      cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${randomUUID()}${ext}`;
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
      "text/plain",
      "application/rtf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not supported. Please upload PDF, TXT, RTF, DOC, DOCX, JPG, or PNG files.`));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // GET /api/auth/user - Get current user (required for useAuth hook)
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // POST /api/documents - Upload a document (protected)
  app.post("/api/documents", isAuthenticated, upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const userId = req.user.claims.sub;
      const { originalname, mimetype, size, filename } = req.file;
      const storedFilePath = path.join(UPLOADS_DIR, filename);

      // Process the file to determine type, title, etc.
      const processedInfo = processUploadedFile({
        originalFileName: originalname,
        mimeType: mimetype,
        sizeBytes: size,
      });

      // Extract text from document using OCR (async, don't block response)
      let extractedText: string | null = null;
      try {
        extractedText = await extractTextFromDocument(storedFilePath, mimetype);
      } catch (error) {
        console.error("OCR extraction failed, continuing without extracted text:", error);
      }

      // Create document record
      const document = await storage.createDocument({
        userId,
        originalFileName: originalname,
        storedFilePath,
        mimeType: mimetype,
        sizeBytes: size,
        documentType: processedInfo.documentType,
        clinicalType: processedInfo.clinicalType,
        title: processedInfo.title,
        source: req.body.source || "Unknown",
        dateOfService: processedInfo.dateOfService,
        shortSummary: processedInfo.shortSummary,
        extractedText: extractedText,
      });

      // Remove storedFilePath from response for security
      const { storedFilePath: _, ...safeDocument } = document;
      res.json(safeDocument);
    } catch (error: any) {
      // Clean up uploaded file if database operation fails
      if (req.file) {
        try {
          await fs.unlink(path.join(UPLOADS_DIR, req.file.filename));
        } catch {}
      }
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/documents - List documents with optional type filter (protected)
  app.get("/api/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documentType = req.query.documentType as string | undefined;
      const clinicalType = req.query.clinicalType as string | undefined;
      const documents = await storage.getDocuments(userId, documentType, clinicalType);
      
      // Remove storedFilePath from all documents for security
      const safeDocuments = documents.map(({ storedFilePath, ...doc }) => doc);
      res.json(safeDocuments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/documents/:id - Get document details (protected)
  app.get("/api/documents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const document = await storage.getDocumentById(id, userId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Remove storedFilePath from response for security
      const { storedFilePath: _, ...safeDocument } = document;
      res.json(safeDocument);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/documents/:id/download - Download document file (protected)
  app.get("/api/documents/:id/download", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const document = await storage.getDocumentById(id, userId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Check if file exists
      try {
        await fs.access(document.storedFilePath);
      } catch {
        return res.status(404).json({ message: "File not found on server" });
      }

      // Set appropriate headers
      res.setHeader("Content-Type", document.mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(document.originalFileName)}"`
      );

      // Stream the file
      res.sendFile(document.storedFilePath);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // DELETE /api/documents/:id - Delete a document (protected)
  app.delete("/api/documents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const document = await storage.getDocumentById(id, userId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Delete file from filesystem
      try {
        await fs.unlink(document.storedFilePath);
      } catch (error) {
        console.error("Error deleting file:", error);
        // Continue with database deletion even if file deletion fails
      }

      // Delete from database
      await storage.deleteDocument(id, userId);

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
