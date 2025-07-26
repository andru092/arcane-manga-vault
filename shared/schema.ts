import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const manga = pgTable("manga", {
  id: text("id").primaryKey(), // MangaDex UUID
  title: text("title").notNull(),
  description: text("description"),
  status: text("status"), // ongoing, completed, hiatus, cancelled
  year: integer("year"),
  contentRating: text("content_rating"), // safe, suggestive, erotica, pornographic
  tags: jsonb("tags").$type<string[]>(),
  coverImageUrl: text("cover_image_url"),
  coverImageS3Key: text("cover_image_s3_key"),
  lastUpdated: timestamp("last_updated"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chapters = pgTable("chapters", {
  id: text("id").primaryKey(), // MangaDex UUID
  mangaId: text("manga_id").notNull().references(() => manga.id),
  title: text("title"),
  chapterNumber: decimal("chapter_number"),
  volumeNumber: decimal("volume_number"),
  language: text("language").default("en"),
  pageCount: integer("page_count"),
  s3BaseKey: text("s3_base_key"), // Base S3 path for chapter pages
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const mangaStats = pgTable("manga_stats", {
  id: serial("id").primaryKey(),
  mangaId: text("manga_id").notNull().references(() => manga.id),
  views: integer("views").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  follows: integer("follows").default(0),
  lastViewedAt: timestamp("last_viewed_at"),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMangaSchema = createInsertSchema(manga).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertChapterSchema = createInsertSchema(chapters).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertMangaStatsSchema = createInsertSchema(mangaStats).omit({
  id: true,
  lastViewedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Manga = typeof manga.$inferSelect;
export type InsertManga = z.infer<typeof insertMangaSchema>;
export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type MangaStats = typeof mangaStats.$inferSelect;
export type InsertMangaStats = z.infer<typeof insertMangaStatsSchema>;
