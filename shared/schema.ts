import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication and profile
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  salonName: text("salon_name"),
  bio: text("bio"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    email: true,
    fullName: true,
    salonName: true,
  })
  .extend({
    password: z.string().min(6, "Password must be at least 6 characters"),
    email: z.string().email("Invalid email format"),
  });

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const userProfileSchema = createInsertSchema(users)
  .partial()
  .omit({ id: true, password: true, createdAt: true, lastLogin: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type UpdateUserProfile = z.infer<typeof userProfileSchema>;
export type User = typeof users.$inferSelect;

// GroomPosts table for storing post data
export const groomPosts = pgTable("groom_posts", {
  id: serial("id").primaryKey(),
  dogName: text("dog_name").notNull(),
  groomingService: text("grooming_service").notNull(),
  notes: text("notes"),
  tags: text("tags"),
  beforeImageUrl: text("before_image_url").notNull(),
  afterImageUrl: text("after_image_url").notNull(),
  caption: text("caption").notNull(),
  userId: integer("user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  instagramUrl: text("instagram_url"),
  instagramPostId: text("instagram_post_id"),
  instagramPermalink: text("instagram_permalink"),
  status: text("status").default("draft").notNull(), // draft, published
});

export const insertGroomPostSchema = createInsertSchema(groomPosts)
  .omit({ id: true, createdAt: true })
  .extend({
    beforeImage: z.string().optional(),
    afterImage: z.string().optional(),
  });

export const updateGroomPostSchema = createInsertSchema(groomPosts)
  .partial()
  .omit({ id: true, createdAt: true });

export type InsertGroomPost = z.infer<typeof insertGroomPostSchema>;
export type UpdateGroomPost = z.infer<typeof updateGroomPostSchema>;
export type GroomPost = typeof groomPosts.$inferSelect;

// CaptionRequest schema for AI caption generation
export const captionRequestSchema = z.object({
  dogName: z.string().min(1, "Dog name is required"),
  groomingService: z.string().min(1, "Grooming service is required"),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

export type CaptionRequest = z.infer<typeof captionRequestSchema>;
