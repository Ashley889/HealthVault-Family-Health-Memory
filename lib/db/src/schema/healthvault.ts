import { date, integer, pgTable, serial, text, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilesTable = pgTable("health_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(),
  dateOfBirth: date("date_of_birth", { mode: "string" }),
  bloodGroup: text("blood_group"),
  color: text("color").notNull().default("sage"),
});

export const healthEventsTable = pgTable("health_events", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profilesTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  description: text("description").notNull(),
  provider: text("provider"),
  location: text("location"),
  medications: text("medications").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  followUp: text("follow_up"),
});

export const remindersTable = pgTable("health_reminders", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profilesTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  detail: text("detail").notNull(),
  status: text("status").notNull().default("upcoming"),
  completed: boolean("completed").notNull().default(false),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({ id: true });
export const insertHealthEventSchema = createInsertSchema(healthEventsTable).omit({ id: true });
export const insertReminderSchema = createInsertSchema(remindersTable).omit({ id: true });

export type Profile = typeof profilesTable.$inferSelect;
export type HealthEvent = typeof healthEventsTable.$inferSelect;
export type Reminder = typeof remindersTable.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertHealthEvent = z.infer<typeof insertHealthEventSchema>;
export type InsertReminder = z.infer<typeof insertReminderSchema>;