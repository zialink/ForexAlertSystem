import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Push notification subscriptions table
export const pushSubscriptions = pgTable("push_subscriptions", {
  endpoint: text("endpoint").primaryKey(),
  subscription: jsonb("subscription").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions);
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
