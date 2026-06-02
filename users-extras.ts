import {
  boolean,
  date,
  integer,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const userCreditsTable = pgTable("user_credits", {
  userId: varchar("user_id").primaryKey(),
  creditsRemaining: integer("credits_remaining").notNull().default(4),
  totalCreditsUsed: integer("total_credits_used").notNull().default(0),
  shareBonusesClaimed: integer("share_bonuses_claimed").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  // Gamification (Builder / Quests).
  xp: integer("xp").notNull().default(0),
  streakCount: integer("streak_count").notNull().default(0),
  bestScore: integer("best_score").notNull().default(0),
  lastBuildDate: date("last_build_date"),
  highestLevelRewarded: integer("highest_level_rewarded").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type UserCredits = typeof userCreditsTable.$inferSelect;
export type InsertUserCredits = typeof userCreditsTable.$inferInsert;

// Per-user flags: owner status, unlimited access, BYO ElevenLabs key.
export const userFlagsTable = pgTable("user_flags", {
  userId: varchar("user_id").primaryKey(),
  isOwner: boolean("is_owner").notNull().default(false),
  unlimited: boolean("unlimited").notNull().default(false),
  unlimitedSource: varchar("unlimited_source"),
  customElevenlabsKey: varchar("custom_elevenlabs_key"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type UserFlags = typeof userFlagsTable.$inferSelect;

// Access codes the owner can mint and share.
export const accessCodesTable = pgTable("access_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code").notNull().unique(),
  label: varchar("label"),
  grantUnlimited: boolean("grant_unlimited").notNull().default(true),
  bonusCredits: integer("bonus_credits").notNull().default(0),
  maxUses: integer("max_uses").notNull().default(1),
  usedCount: integer("used_count").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type AccessCode = typeof accessCodesTable.$inferSelect;

// Track which user redeemed which code (one redemption per user per code).
export const codeRedemptionsTable = pgTable(
  "code_redemptions",
  {
    id: serial("id").primaryKey(),
    codeId: integer("code_id").notNull(),
    userId: varchar("user_id").notNull(),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("redeem_code_user_uniq").on(t.codeId, t.userId)],
);

export type CodeRedemption = typeof codeRedemptionsTable.$inferSelect;

// Custom ElevenLabs voices that a user pastes in.
export const userCustomVoicesTable = pgTable("user_custom_voices", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: varchar("name").notNull(),
  voiceId: varchar("voice_id").notNull(),
  market: varchar("market").notNull(),
  description: varchar("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type UserCustomVoice = typeof userCustomVoicesTable.$inferSelect;

// Earn-Quests: gamified daily creator challenges.
export const questsTable = pgTable("quests", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: varchar("title").notNull(),
  description: varchar("description").notNull(),
  niche: varchar("niche"),
  difficulty: varchar("difficulty").notNull(),
  xpReward: integer("xp_reward").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Quest = typeof questsTable.$inferSelect;
export type InsertQuest = typeof questsTable.$inferInsert;
