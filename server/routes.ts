import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertGroomPostSchema, updateGroomPostSchema, captionRequestSchema } from "@shared/schema";
import { generateCaption } from "./lib/openai";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: storage2,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use("/uploads", express.static(uploadsDir));

  // Get all groom posts
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getGroomPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching posts" });
    }
  });

  // Get a single groom post
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const post = await storage.getGroomPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Error fetching post" });
    }
  });

  // Upload images for a post
  app.post(
    "/api/upload",
    upload.fields([
      { name: "beforeImage", maxCount: 1 },
      { name: "afterImage", maxCount: 1 },
    ]),
    (req, res) => {
      try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        if (!files.beforeImage || !files.afterImage) {
          return res.status(400).json({ message: "Both before and after images are required" });
        }

        const beforeImagePath = `/uploads/${files.beforeImage[0].filename}`;
        const afterImagePath = `/uploads/${files.afterImage[0].filename}`;

        res.json({
          beforeImageUrl: beforeImagePath,
          afterImageUrl: afterImagePath,
        });
      } catch (error) {
        res.status(500).json({ message: "Error uploading files" });
      }
    }
  );

  // Generate caption
  app.post("/api/generate-caption", async (req, res) => {
    try {
      const validData = captionRequestSchema.parse(req.body);
      const caption = await generateCaption(validData);
      res.json({ caption });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Error generating caption" });
    }
  });

  // Create a new groom post
  app.post("/api/posts", async (req, res) => {
    try {
      const validData = insertGroomPostSchema.parse(req.body);
      const post = await storage.createGroomPost(validData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Error creating post" });
    }
  });

  // Update a groom post
  app.patch("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const validData = updateGroomPostSchema.parse(req.body);
      const post = await storage.updateGroomPost(id, validData);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.json(post);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Error updating post" });
    }
  });

  // Delete a groom post
  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const success = await storage.deleteGroomPost(id);
      if (!success) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting post" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import express from "express";
