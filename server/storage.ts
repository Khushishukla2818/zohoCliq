// Storage interface and implementation - references javascript_database blueprint
import { 
  cliqUsers, notionTokens, mappings, notificationSettings, activityLog,
  type CliqUser, type InsertCliqUser,
  type NotionToken, type InsertNotionToken,
  type Mapping, type InsertMapping,
  type NotificationSettings, type InsertNotificationSettings,
  type ActivityLog, type InsertActivityLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Cliq Users
  getCliqUser(id: string): Promise<CliqUser | undefined>;
  getCliqUserByCliqUserId(cliqUserId: string): Promise<CliqUser | undefined>;
  createCliqUser(user: InsertCliqUser): Promise<CliqUser>;
  
  // Notion Tokens
  getNotionToken(cliqUserId: string): Promise<NotionToken | undefined>;
  createOrUpdateNotionToken(token: InsertNotionToken): Promise<NotionToken>;
  deleteNotionToken(cliqUserId: string): Promise<void>;
  
  // Mappings
  createMapping(mapping: InsertMapping): Promise<Mapping>;
  getMappingsByUserId(cliqUserId: string): Promise<Mapping[]>;
  getMappingByNotionPageId(pageId: string): Promise<Mapping | undefined>;
  
  // Notification Settings
  getNotificationSettings(cliqUserId: string): Promise<NotificationSettings | undefined>;
  createOrUpdateNotificationSettings(settings: InsertNotificationSettings): Promise<NotificationSettings>;
  
  // Activity Log
  createActivityLog(activity: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogByUserId(cliqUserId: string, limit?: number): Promise<ActivityLog[]>;
}

export class DatabaseStorage implements IStorage {
  // Cliq Users
  async getCliqUser(id: string): Promise<CliqUser | undefined> {
    const [user] = await db.select().from(cliqUsers).where(eq(cliqUsers.id, id));
    return user || undefined;
  }

  async getCliqUserByCliqUserId(cliqUserId: string): Promise<CliqUser | undefined> {
    const [user] = await db.select().from(cliqUsers).where(eq(cliqUsers.cliqUserId, cliqUserId));
    return user || undefined;
  }

  async createCliqUser(insertUser: InsertCliqUser): Promise<CliqUser> {
    const [user] = await db
      .insert(cliqUsers)
      .values(insertUser)
      .returning();
    return user;
  }

  // Notion Tokens
  async getNotionToken(cliqUserId: string): Promise<NotionToken | undefined> {
    const [token] = await db
      .select()
      .from(notionTokens)
      .where(eq(notionTokens.cliqUserId, cliqUserId));
    return token || undefined;
  }

  async createOrUpdateNotionToken(insertToken: InsertNotionToken): Promise<NotionToken> {
    // Check if token exists
    const existing = await this.getNotionToken(insertToken.cliqUserId);
    
    if (existing) {
      // Update existing token
      const [updated] = await db
        .update(notionTokens)
        .set({ ...insertToken, updatedAt: new Date() })
        .where(eq(notionTokens.cliqUserId, insertToken.cliqUserId))
        .returning();
      return updated;
    } else {
      // Create new token
      const [created] = await db
        .insert(notionTokens)
        .values(insertToken)
        .returning();
      return created;
    }
  }

  async deleteNotionToken(cliqUserId: string): Promise<void> {
    await db
      .delete(notionTokens)
      .where(eq(notionTokens.cliqUserId, cliqUserId));
  }

  // Mappings
  async createMapping(insertMapping: InsertMapping): Promise<Mapping> {
    const [mapping] = await db
      .insert(mappings)
      .values(insertMapping)
      .returning();
    return mapping;
  }

  async getMappingsByUserId(cliqUserId: string): Promise<Mapping[]> {
    return await db
      .select()
      .from(mappings)
      .where(eq(mappings.cliqUserId, cliqUserId))
      .orderBy(desc(mappings.createdAt));
  }

  async getMappingByNotionPageId(pageId: string): Promise<Mapping | undefined> {
    const [mapping] = await db
      .select()
      .from(mappings)
      .where(eq(mappings.notionPageId, pageId));
    return mapping || undefined;
  }

  // Notification Settings
  async getNotificationSettings(cliqUserId: string): Promise<NotificationSettings | undefined> {
    const [settings] = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.cliqUserId, cliqUserId));
    return settings || undefined;
  }

  async createOrUpdateNotificationSettings(insertSettings: InsertNotificationSettings): Promise<NotificationSettings> {
    // Check if settings exist
    const existing = await this.getNotificationSettings(insertSettings.cliqUserId);
    
    if (existing) {
      // Update existing settings
      const [updated] = await db
        .update(notificationSettings)
        .set({ ...insertSettings, updatedAt: new Date() })
        .where(eq(notificationSettings.cliqUserId, insertSettings.cliqUserId))
        .returning();
      return updated;
    } else {
      // Create new settings
      const [created] = await db
        .insert(notificationSettings)
        .values(insertSettings)
        .returning();
      return created;
    }
  }

  // Activity Log
  async createActivityLog(insertActivity: InsertActivityLog): Promise<ActivityLog> {
    const [activity] = await db
      .insert(activityLog)
      .values(insertActivity)
      .returning();
    return activity;
  }

  async getActivityLogByUserId(cliqUserId: string, limit = 20): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.cliqUserId, cliqUserId))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
