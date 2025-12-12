import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function log(message: string, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });

    console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
    // Assuming build output is in "dist" at the project root
    // and this file is in "dist-server" or "server"
    // If in "dist-server" (production), we need to go up one level then to "dist"
    // If in "server" (dev), we need to go up one level then to "dist"
    // Wait, in dev we don't use serveStatic usually.

    // The original code was path.resolve(import.meta.dirname, "public") which was weird if outDir was dist/public
    // Let's assume standard structure:
    // /dist (frontend assets)
    // /dist-server (backend code)

    const distPath = path.resolve(import.meta.dirname, "..", "dist");

    if (!fs.existsSync(distPath)) {
        // Check if it's the old public folder just in case or if running from source
        const oldDistPath = path.resolve(import.meta.dirname, "public");
        if (fs.existsSync(oldDistPath)) {
            app.use(express.static(oldDistPath));
            app.use("*", (_req, res) => {
                res.sendFile(path.resolve(oldDistPath, "index.html"));
            });
            return;
        }
    }

    if (!fs.existsSync(distPath)) {
        throw new Error(
            `Could not find the build directory: ${distPath}, make sure to build the client first`,
        );
    }

    app.use(express.static(distPath));

    // fall through to index.html if the file doesn't exist
    app.use("*", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
    });
}
