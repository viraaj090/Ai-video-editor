import {
  doublePrecision,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const historyTable = pgTable("history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  market: varchar("market", { length: 16 }).notNull(),
  script: text("script").notNull(),
  voiceName: varchar("voice_name"),
  mp4Url: text("mp4_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  durationSeconds: doublePrecision("duration_seconds").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type HistoryRow = typeof historyTable.$inferSelect;
export type InsertHistoryRow = typeof historyTable.$inferInsert;
