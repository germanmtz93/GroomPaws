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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, GroomPost>;
  private userCurrentId: number;
  private postCurrentId: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.userCurrentId = 1;
    this.postCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Groom Post methods
  async getGroomPosts(): Promise<GroomPost[]> {
    return Array.from(this.posts.values()).sort((a, b) => {
      // Sort by createdAt in descending order (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async getGroomPost(id: number): Promise<GroomPost | undefined> {
    return this.posts.get(id);
  }

  async createGroomPost(insertPost: InsertGroomPost): Promise<GroomPost> {
    const id = this.postCurrentId++;
    const now = new Date();
    
    // Create a GroomPost from the InsertGroomPost
    // Filter out the beforeImage and afterImage fields which are used for base64 data
    const { beforeImage, afterImage, ...postData } = insertPost;
    
    const post: GroomPost = { 
      ...postData, 
      id,
      createdAt: now,
      status: insertPost.status || 'draft'
    };
    
    this.posts.set(id, post);
    return post;
  }

  async updateGroomPost(id: number, updateData: UpdateGroomPost): Promise<GroomPost | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;

    // Filter out the beforeImage and afterImage fields
    const { beforeImage, afterImage, ...postData } = updateData;
    
    const updatedPost: GroomPost = { ...post, ...postData };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteGroomPost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }
}

export const storage = new MemStorage();
