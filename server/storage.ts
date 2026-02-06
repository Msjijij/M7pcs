import { db } from "./db";
import {
  users, products, subscriptions, topups, announcements, activityLogs,
  type User, type Product, type Subscription, type Topup, type Announcement, type ActivityLog,
  type InsertProduct, type InsertSubscription, type InsertTopup, type InsertAnnouncement
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;

  getSubscriptions(userId?: string): Promise<(Subscription & { product: Product })[]>;
  getSubscription(id: number): Promise<Subscription | undefined>;
  createSubscription(userId: string, sub: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription>;
  deleteSubscription(id: number): Promise<void>;

  getTopups(userId?: string): Promise<Topup[]>;
  getTopup(id: number): Promise<Topup | undefined>;
  createTopup(userId: string, topup: InsertTopup): Promise<Topup>;
  updateTopup(id: number, updates: Partial<Topup>): Promise<Topup>;

  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getTopSpenders(limit: number): Promise<User[]>;

  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: number): Promise<Announcement | undefined>;
  createAnnouncement(createdBy: string, announcement: InsertAnnouncement): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;

  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
  createActivityLog(actorId: string, action: string, targetType: string, targetId: string, metadata?: string): Promise<ActivityLog>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return product;
  }

  async getSubscriptions(userId?: string): Promise<(Subscription & { product: Product })[]> {
    const baseQuery = db.select({
      subscriptions,
      product: products,
    })
    .from(subscriptions)
    .innerJoin(products, eq(subscriptions.productId, products.id))
    .orderBy(desc(subscriptions.createdAt));

    const results = userId
      ? await baseQuery.where(eq(subscriptions.userId, userId))
      : await baseQuery;

    return results.map(row => ({
      ...row.subscriptions,
      product: row.product,
    })) as (Subscription & { product: Product })[];
  }

  async getSubscription(id: number): Promise<Subscription | undefined> {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return sub;
  }

  async createSubscription(userId: string, sub: InsertSubscription): Promise<Subscription> {
    const [newSub] = await db.insert(subscriptions).values({ ...sub, userId }).returning();
    return newSub;
  }

  async updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription> {
    const [updated] = await db.update(subscriptions).set(updates).where(eq(subscriptions.id, id)).returning();
    return updated;
  }

  async deleteSubscription(id: number): Promise<void> {
    await db.delete(subscriptions).where(eq(subscriptions.id, id));
  }

  async getTopups(userId?: string): Promise<Topup[]> {
    if (userId) {
      return await db.select().from(topups).where(eq(topups.userId, userId)).orderBy(desc(topups.createdAt));
    }
    return await db.select().from(topups).orderBy(desc(topups.createdAt));
  }

  async getTopup(id: number): Promise<Topup | undefined> {
    const [topup] = await db.select().from(topups).where(eq(topups.id, id));
    return topup;
  }

  async createTopup(userId: string, topup: InsertTopup): Promise<Topup> {
    const [newTopup] = await db.insert(topups).values({ ...topup, userId }).returning();
    return newTopup;
  }

  async updateTopup(id: number, updates: Partial<Topup>): Promise<Topup> {
    const [updated] = await db.update(topups).set(updates).where(eq(topups.id, id)).returning();
    return updated;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(topups).where(eq(topups.userId, id));
    await db.delete(subscriptions).where(eq(subscriptions.userId, id));
    await db.delete(announcements).where(eq(announcements.createdBy, id));
    await db.delete(users).where(eq(users.id, id));
  }

  async getTopSpenders(limit: number = 10): Promise<User[]> {
    return await db.select().from(users)
      .where(sql`${users.totalSpent} > 0`)
      .orderBy(desc(users.totalSpent))
      .limit(limit);
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, id));
    return announcement;
  }

  async createAnnouncement(createdBy: string, announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db.insert(announcements).values({ ...announcement, createdBy }).returning();
    return newAnnouncement;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  async getActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
  }

  async createActivityLog(actorId: string, action: string, targetType: string, targetId: string, metadata?: string): Promise<ActivityLog> {
    const [log] = await db.insert(activityLogs).values({ actorId, action, targetType, targetId, metadata }).returning();
    return log;
  }
}

export const storage = new DatabaseStorage();
