import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";
import { processUploadedFile } from "./documentProcessor";

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
  // Ensure demo patient exists
  const DEMO_PATIENT_ID = 1;
  
  app.post("/api/init-demo-patient", async (req, res) => {
    try {
      const existingPatient = await storage.getPatient(DEMO_PATIENT_ID);
      if (!existingPatient) {
        await storage.createPatient({
          name: "Jane Doe",
          email: "jane.doe@example.com",
        });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // POST /api/documents - Upload a document
  app.post("/api/documents", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const { originalname, mimetype, size, filename } = req.file;
      const storedFilePath = path.join(UPLOADS_DIR, filename);

      // Process the file to determine type, title, etc.
      const processedInfo = processUploadedFile({
        originalFileName: originalname,
        mimeType: mimetype,
        sizeBytes: size,
      });

      // Create document record
      const document = await storage.createDocument({
        patientId: DEMO_PATIENT_ID,
        originalFileName: originalname,
        storedFilePath,
        mimeType: mimetype,
        sizeBytes: size,
        documentType: processedInfo.documentType,
        title: processedInfo.title,
        source: req.body.source || "Unknown",
        dateOfService: processedInfo.dateOfService,
        shortSummary: processedInfo.shortSummary,
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

  // GET /api/documents - List documents with optional type filter
  app.get("/api/documents", async (req, res) => {
    try {
      const documentType = req.query.documentType as string | undefined;
      const documents = await storage.getDocuments(DEMO_PATIENT_ID, documentType);
      
      // Remove storedFilePath from all documents for security
      const safeDocuments = documents.map(({ storedFilePath, ...doc }) => doc);
      res.json(safeDocuments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/documents/:id - Get document details
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const document = await storage.getDocumentById(id);
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

  // GET /api/documents/:id/download - Download document file
  app.get("/api/documents/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const document = await storage.getDocumentById(id);
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

  // DELETE /api/documents/:id - Delete a document
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const document = await storage.getDocumentById(id);
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
      await storage.deleteDocument(id);

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
