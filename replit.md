# Celia - Medical Document Management System

## Overview

Celia is a full-stack web application for managing medical documents with an AI-powered medical assistant. Patients can securely upload, organize, and view various types of medical files including lab reports, medical images, prescriptions, and doctor notes. The application features:
- Automatic document type classification and OCR text extraction
- AI medical assistant powered by Gemini AI for answering questions about medical history
- Comprehensive PDF report generation with medical history summaries
- Clean, healthcare-appropriate interface built with Material Design principles

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript
- Single-page application using Wouter for client-side routing
- Component-based architecture with reusable UI components
- State management via TanStack Query (React Query) for server state
- Form handling with React Hook Form and Zod validation

**UI Component System**: Shadcn/ui with Radix UI primitives
- Consistent design system based on Material Design principles adapted for healthcare
- Tailwind CSS for styling with custom healthcare-appropriate color palette
- "New York" style variant with neutral base colors
- Responsive layout with mobile-first approach

**Design Philosophy**:
- Clinical Clarity: Clear information hierarchy for quick scanning
- Trust Through Consistency: Predictable patterns for user confidence
- Calm Professionalism: Subdued medical aesthetic without sterility
- Typography: Inter font family with defined weight and size hierarchy
- Spacing: Tailwind utility-based system (2, 4, 6, 8, 12, 16 units)

**Key Pages**:
- Dashboard: Main vault view with upload zone and document grid
- Document Detail: Individual document view with metadata and actions
- AI Chat: Medical assistant chat interface for querying medical history
- Landing: Login page with feature highlights
- Not Found: 404 error page

**File Upload Support**:
- Documents: PDF, TXT, RTF, DOC, DOCX
- Images: JPEG, PNG
- Maximum file size: 20MB
- Drag-and-drop with multi-file support

### Backend Architecture

**Runtime**: Node.js with Express
- TypeScript for type safety across the stack
- ESM module system
- Development mode with hot reloading via Vite

**API Design**: RESTful endpoints

*Document Management*:
- `GET /api/documents` - List documents with optional type filtering
- `GET /api/documents/:id` - Get single document details
- `POST /api/documents` - Upload new document (multipart/form-data)
- `GET /api/documents/:id/download` - Download original file
- `DELETE /api/documents/:id` - Remove document

*AI Chat Assistant*:
- `POST /api/chat/message` - Send message to AI assistant (creates/updates conversation)
- `GET /api/chat/conversations` - List user's chat conversations
- `GET /api/chat/conversations/:id/messages` - Get messages for a specific conversation
- `POST /api/chat/report` - Generate and download comprehensive PDF medical report

**File Processing**:
- Rule-based document classification using filename and MIME type patterns
- Automatic title generation from filenames
- Storage in local filesystem with UUID-based filenames
- Original filename preservation in metadata

**Document Classification Logic**:
- Medical images: Detected from image MIME types + keywords (scan, MRI, CT, X-ray, ultrasound)
- Lab reports: Keywords like lab, result, test, blood, panel
- Prescriptions: Keywords like prescription, rx, medication
- Doctor notes: Keywords like note, visit, consultation
- Default: "Other" category for unclassified documents

### Data Storage

**Database**: PostgreSQL via Neon serverless
- ORM: Drizzle ORM with type-safe queries
- WebSocket connection for serverless deployment
- Migration management via drizzle-kit

**Schema Design**:

*Users Table*:
- Primary key: UUID (varchar)
- Fields: email, firstName, lastName, profileImageUrl
- Authentication via Replit Auth
- Timestamps: createdAt, updatedAt

*Documents Table*:
- Primary key: Auto-incrementing integer ID
- Foreign key: userId references users (varchar)
- Metadata: originalFileName, storedFilePath, mimeType, sizeBytes
- Classification: documentType (enum), clinicalType, title, source, dateOfService
- Content: shortSummary, extractedText (OCR)
- Timestamps: createdAt, updatedAt

*Chat Conversations Table*:
- Primary key: Auto-incrementing integer ID
- Foreign key: userId references users (varchar)
- Fields: title (auto-generated from first message)
- Timestamps: createdAt, updatedAt

*Chat Messages Table*:
- Primary key: Auto-incrementing integer ID
- Foreign key: conversationId references chat_conversations
- Fields: role (user/assistant), content, documentsReferenced (array of document IDs)
- Timestamp: createdAt

**Document Types Enum**:
- lab_report
- medical_image
- doctor_note
- prescription
- other

### Build & Deployment

**Development**:
- Vite dev server with HMR for frontend
- tsx for backend with automatic restart
- Concurrent development mode

**Production Build**:
- Vite builds optimized React bundle to dist/public
- esbuild bundles server code to dist/index.js
- Static file serving from built assets

**Environment Requirements**:
- DATABASE_URL: PostgreSQL connection string (required)
- NODE_ENV: development or production

## External Dependencies

### UI Component Libraries
- **Radix UI**: Headless UI primitives for accessibility
  - Dialog, Dropdown, Popover, Toast, Sidebar, and 20+ other components
  - Provides ARIA-compliant foundations
- **Shadcn/ui**: Pre-built component implementations using Radix
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Variant-based component styling
- **date-fns**: Date formatting and manipulation

### Frontend State & Forms
- **TanStack Query**: Server state management, caching, and synchronization
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation for forms and API data
- **Wouter**: Lightweight client-side routing

### Backend Services
- **Neon Database**: Serverless PostgreSQL hosting
  - @neondatabase/serverless: Connection driver with WebSocket support
- **Drizzle ORM**: Type-safe database queries and migrations
  - drizzle-zod: Generate Zod schemas from database schema

### AI/ML Services
- **Gemini AI**: OCR text extraction, document analysis, and medical chat assistant
  - @google/genai: Gemini SDK for TypeScript
  - Replit AI Integrations: Built-in Gemini access without API key
  - Capabilities: Text extraction from images/PDFs, medical history analysis, date-based queries, comprehensive report generation

### PDF Generation
- **PDFKit**: Server-side PDF generation for medical reports
  - Branded reports with MedVault header
  - Formatted medical history summaries
  - Professional typography and layout

### File Handling
- **Multer**: Multipart form data parsing for file uploads
- **react-dropzone**: Drag-and-drop file upload UI

### Development Tools
- **Vite**: Frontend build tool and dev server
- **esbuild**: Fast JavaScript bundler for production
- **tsx**: TypeScript execution for development
- **TypeScript**: Type safety across full stack

### Replit-Specific
- @replit/vite-plugin-runtime-error-modal: Error overlay
- @replit/vite-plugin-cartographer: Code navigation
- @replit/vite-plugin-dev-banner: Development indicators

## AI Medical Assistant Features

### Chat Interface
The AI Medical Assistant provides natural language access to medical document information:

**Capabilities**:
- Answer questions about medical history ("Did I ever have any surgeries?")
- Search documents by date ("What tests did I do in 2024?")
- List medications and prescriptions
- Explain medical terms and findings
- Generate comprehensive medical history reports

**Technical Implementation**:
- Powered by Gemini AI (gemini-1.5-flash model)
- Analyzes extracted text from all user documents
- Maintains conversation history with contextual awareness
- Auto-generates conversation titles from first message
- References specific documents in responses

### PDF Report Generation
Users can generate comprehensive medical history reports:
- **Format**: Professional PDF with MedVault branding
- **Content**: Organized summary of all medical documents
- **Sections**: Chronological history, key findings, document references
- **Download**: Automatic browser download with dated filename

### OCR Text Extraction
All uploaded documents undergo automatic text extraction:
- **Images**: Gemini Vision API extracts text from medical images
- **PDFs**: Text extraction from scanned/digital PDFs
- **Processing Time**: 5-10 seconds per document
- **Indexing**: Extracted text stored in database for AI analysis

## Recent Changes (November 2025)

### AI Chat Assistant Implementation
- Added AI-powered medical chat assistant using Gemini AI
- Created database schema for conversations and messages
- Built chat interface with conversation history sidebar
- Implemented PDF report generation with PDFKit
- Enhanced landing page to highlight AI capabilities
- Fixed React hooks ordering bug for proper route handling
- Integrated Replit OIDC authentication for secure access

### Document Citation System (November 10, 2025)
- Added documentsReferenced field to chat_messages table (integer array)
- Implemented clickable citation badges in chat UI below assistant messages
- Citations display as "Sources: Doc #1, Doc #2" with links to document detail pages
- Each citation includes FileText and ExternalLink icons for clear UX
- Citations validate document IDs from AI responses to prevent hallucinations

### UI/UX Enhancements (November 10, 2025)
- Created professional Footer component with Celia branding
- Added footer to all pages: landing, dashboard, document detail, and chat
- Footer includes features list, security information, and medical disclaimer
- Removed all "Replit" branding from user-facing elements
- Updated login button from "Log In with Replit" to "Sign In"

### Branding and Layout Updates (November 11, 2025)
- Rebranded entire application from "MedVault" to "Celia" across all UI and server files
- Fixed footer layout to stay at bottom of page using min-h-screen and flex-col
- Added Home button to AI Assistant chat screen for easy navigation back to dashboard
- View mode switcher (By Date, By Category, By Clinical Type) uses shadcn Tabs with proper active states
- Updated all titles, headers, footers, and PDF report generation with Celia branding

### AI-Powered Document Classification (November 11, 2025)
- Implemented intelligent document classification using Gemini AI
- AI automatically extracts from uploaded documents:
  - Meaningful document titles (e.g., "Complete Blood Count - January 2024")
  - Document type classification (lab report, medical image, prescription, doctor note, other)
  - Multiple clinical specialties if document covers multiple medical areas
  - Date of service from document content
  - Brief summary of key findings
- Multi-category support: Documents can appear in multiple clinical type views
- Added `clinicalTypes` array field to documents table for multi-category placement
- Enhanced storage queries to filter by both primary and secondary clinical categories
- Fallback to rule-based classification if AI is unavailable