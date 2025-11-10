# MedVault Demo - Medical Document Management System

## Overview

MedVault Demo is a full-stack web application for managing medical documents. It allows patients to securely upload, organize, and view various types of medical files including lab reports, medical images, prescriptions, and doctor notes. The application features automatic document type classification, file organization, and a clean, healthcare-appropriate interface built with Material Design principles.

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
- `GET /api/documents` - List documents with optional type filtering
- `GET /api/documents/:id` - Get single document details
- `POST /api/documents` - Upload new document (multipart/form-data)
- `GET /api/documents/:id/download` - Download original file
- `DELETE /api/documents/:id` - Remove document

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
- **Gemini AI**: OCR text extraction and document analysis
  - @google/genai: Gemini SDK for TypeScript
  - Replit AI Integrations: Built-in Gemini access without API key

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