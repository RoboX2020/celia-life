# Celia-life

A personal health record management system featuring medical document analysis and AI-powered chat assistance.

## Features

- **Document Management**: Upload and organize medical records (PDF, Images).
- **AI Analysis**: Automatically extract text and summarize documents using Google Gemini.
- **Medical Chat**: Ask questions about your health history with AI-powered context from your documents.
- **Secure Auth**: Google OAuth 2.0 / OpenID Connect.

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Shadcn UI.
- **Backend**: Express.js, serverless-compatible (Vercel).
- **Database**: PostgreSQL (Neon), Drizzle ORM.
- **AI**: Google Gemini Pro (via `@google/genai`).
- **Auth**: `openid-client`, `passport` (Google OIDC).

## Getting Started (Local)

### Prerequisites

- Node.js (v20+)
- PostgreSQL Database (Neon recommended)
- Google Cloud Project (for OAuth and Gemini API)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/RoboX2020/celia-life.git
    cd celia-life
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL=postgresql://user:pass@host/db
    PGSSLMODE=require
    SESSION_SECRET=your_super_secret_key
    
    # Google Auth
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    
    # Google Gemini AI
    AI_INTEGRATIONS_GEMINI_API_KEY=your_gemini_api_key
    ```

4.  **Run Migrations**:
    ```bash
    npm run db:push
    ```

5.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    Access the app at [http://localhost:5001](http://localhost:5001).

## Deployment (Vercel)

The project is configured for Vercel Serverless deployment using a hybrid build approach (`dist/public` for static assets, `dist-server` for the API).

### 1. Deploy
```bash
npx vercel deploy --prod
```

### 2. Vercel Project Settings (Critical)
In your Vercel Dashboard, go to **Settings -> Build & Development**:
- **Output Directory**: `dist/public`
- **One-Click Deployment**: If using Git integration, ensure the build command is `npm run build`.

### 3. Environment Variables (Vercel)
Add all variables from your local `.env`. Additionally, add:
- `APP_URL`: `https://your-app.vercel.app` (No trailing slash).

### 4. Google Auth Configuration
Update your Google Cloud Console Credentials:
- **Authorized Redirect URI**: `https://your-app.vercel.app/api/callback`

## Authentication Setup

This project uses **Google OIDC**. To set it up:

1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Create new **OAuth 2.0 Credentials** (Web Application).
3.  Set Redirect URIs:
    - Local: `http://localhost:5001/api/callback`
    - Prod: `https://<your-vercel-domain>/api/callback`
4.  Copy Client ID and Secret to `.env`.
