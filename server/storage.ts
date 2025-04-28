import { groomPosts, users, type User, type InsertUser, type GroomPost, type InsertGroomPost, type UpdateGroomPost } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<User | undefined>;
  updateUserProfile(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Groom Post operations
  getGroomPosts(): Promise<GroomPost[]>;
  getUserGroomPosts(userId: number): Promise<GroomPost[]>;
  getGroomPost(id: number): Promise<GroomPost | undefined>;
  createGroomPost(post: InsertGroomPost): Promise<GroomPost>;
  updateGroomPost(id: number, post: UpdateGroomPost): Promise<GroomPost | undefined>;
  deleteGroomPost(id: number): Promise<boolean>;
  
  // Session store for authentication
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserLastLogin(id: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserProfile(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Groom Post methods
  async getGroomPosts(): Promise<GroomPost[]> {
    return db.select().from(groomPosts).orderBy(groomPosts.createdAt);
  }

  async getUserGroomPosts(userId: number): Promise<GroomPost[]> {
    return db
      .select()
      .from(groomPosts)
      .where(eq(groomPosts.userId, userId))
      .orderBy(groomPosts.createdAt);
  }

  async getGroomPost(id: number): Promise<GroomPost | undefined> {
    const [post] = await db.select().from(groomPosts).where(eq(groomPosts.id, id));
    return post;
  }

  async createGroomPost(insertPost: InsertGroomPost): Promise<GroomPost> {
    // Filter out the beforeImage and afterImage fields which are used for base64 data
    const { beforeImage, afterImage, ...postData } = insertPost as any;
    
    const [post] = await db.insert(groomPosts).values(postData).returning();
    return post;
  }

  async updateGroomPost(id: number, updateData: UpdateGroomPost): Promise<GroomPost | undefined> {
    // In case beforeImage/afterImage was passed through, remove them
    const { beforeImage, afterImage, ...postData } = updateData as any;
    
    const [post] = await db
      .update(groomPosts)
      .set(postData)
      .where(eq(groomPosts.id, id))
      .returning();
    return post;
  }

  async deleteGroomPost(id: number): Promise<boolean> {
    const result = await db.delete(groomPosts).where(eq(groomPosts.id, id));
    return result.count > 0;
  }
}

// Create and initialize database with initial schema
export const storage = new DatabaseStorage();
