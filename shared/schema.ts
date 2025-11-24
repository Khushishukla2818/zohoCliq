import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Cliq Users table - stores Zoho Cliq user information
export const cliqUsers = pgTable("cliq_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cliqUserId: varchar("cliq_user_id").notNull().unique(),
  cliqDisplayName: varchar("cliq_display_name"),
  cliqEmail: varchar("cliq_email"),
  connectedAt: timestamp("connected_at").notNull().defaultNow(),
});

// Notion Tokens table - stores OAuth tokens for Notion integration
export const notionTokens = pgTable("notion_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cliqUserId: varchar("cliq_user_id").notNull().references(() => cliqUsers.id, { onDelete: "cascade" }),
  accessToken: text("access_token").notNull(),
  botId: varchar("bot_id"),
  workspaceId: varchar("workspace_id"),
  workspaceName: varchar("workspace_name"),
  workspaceIcon: varchar("workspace_icon"),
  owner: jsonb("owner"),
  duplicatedTemplateId: varchar("duplicated_template_id"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Mappings table - links Cliq messages/channels to Notion pages
export const mappings = pgTable("mappings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cliqMessageId: varchar("cliq_message_id"),
  cliqChannelId: varchar("cliq_channel_id"),
  notionPageId: varchar("notion_page_id").notNull(),
  notionPageUrl: text("notion_page_url"),
  cliqUserId: varchar("cliq_user_id").notNull().references(() => cliqUsers.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notification Settings table - user preferences for reminders
export const notificationSettings = pgTable("notification_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cliqUserId: varchar("cliq_user_id").notNull().unique().references(() => cliqUsers.id, { onDelete: "cascade" }),
  remindersEnabled: boolean("reminders_enabled").notNull().default(true),
  reminderHoursBefore: integer("reminder_hours_before").notNull().default(24),
  notifyOnTaskAssigned: boolean("notify_on_task_assigned").notNull().default(true),
  notifyOnTaskUpdated: boolean("notify_on_task_updated").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Activity Log table - tracks all integration activities
export const activityLog = pgTable("activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cliqUserId: varchar("cliq_user_id").notNull().references(() => cliqUsers.id),
  activityType: varchar("activity_type").notNull(), // 'task_created', 'task_updated', 'doc_created', 'search', 'message_saved'
  description: text("description").notNull(),
  notionPageId: varchar("notion_page_id"),
  notionPageTitle: text("notion_page_title"),
  notionPageUrl: text("notion_page_url"),
  metadata: jsonb("metadata"), // Additional data like task status, due date, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const cliqUsersRelations = relations(cliqUsers, ({ one, many }) => ({
  notionToken: one(notionTokens, {
    fields: [cliqUsers.id],
    references: [notionTokens.cliqUserId],
  }),
  mappings: many(mappings),
  activityLogs: many(activityLog),
  notificationSettings: one(notificationSettings, {
    fields: [cliqUsers.id],
    references: [notificationSettings.cliqUserId],
  }),
}));

export const notionTokensRelations = relations(notionTokens, ({ one }) => ({
  cliqUser: one(cliqUsers, {
    fields: [notionTokens.cliqUserId],
    references: [cliqUsers.id],
  }),
}));

export const mappingsRelations = relations(mappings, ({ one }) => ({
  cliqUser: one(cliqUsers, {
    fields: [mappings.cliqUserId],
    references: [cliqUsers.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  cliqUser: one(cliqUsers, {
    fields: [activityLog.cliqUserId],
    references: [cliqUsers.id],
  }),
}));

export const notificationSettingsRelations = relations(notificationSettings, ({ one }) => ({
  cliqUser: one(cliqUsers, {
    fields: [notificationSettings.cliqUserId],
    references: [cliqUsers.id],
  }),
}));

// Insert schemas
export const insertCliqUserSchema = createInsertSchema(cliqUsers).omit({
  id: true,
  connectedAt: true,
});

export const insertNotionTokenSchema = createInsertSchema(notionTokens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMappingSchema = createInsertSchema(mappings).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSettingsSchema = createInsertSchema(notificationSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({
  id: true,
  createdAt: true,
});

// Types
export type CliqUser = typeof cliqUsers.$inferSelect;
export type InsertCliqUser = z.infer<typeof insertCliqUserSchema>;

export type NotionToken = typeof notionTokens.$inferSelect;
export type InsertNotionToken = z.infer<typeof insertNotionTokenSchema>;

export type Mapping = typeof mappings.$inferSelect;
export type InsertMapping = z.infer<typeof insertMappingSchema>;

export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type InsertNotificationSettings = z.infer<typeof insertNotificationSettingsSchema>;

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// Additional types for frontend use
export type NotionTask = {
  id: string;
  title: string;
  status: string;
  dueDate?: string;
  assignee?: string;
  url: string;
  properties: Record<string, any>;
};

export type NotionDocument = {
  id: string;
  title: string;
  icon?: string;
  lastEditedTime: string;
  url: string;
};

export type SearchResult = {
  id: string;
  title: string;
  type: 'page' | 'database';
  icon?: string;
  url: string;
  parent?: string;
};

export type ActivityItem = {
  id: string;
  type: string;
  description: string;
  pageTitle?: string;
  pageUrl?: string;
  timestamp: string;
};
