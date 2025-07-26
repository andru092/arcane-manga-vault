import { 
  users, 
  type User, 
  type InsertUser, 
  type Manga, 
  type InsertManga, 
  type Chapter, 
  type InsertChapter,
  type MangaStats,
  type InsertMangaStats
} from "@shared/schema";
import { mongoDBService } from "./services/mongodb";
import { fallbackStorage } from "./services/fallback-storage";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Manga operations
  createManga(manga: InsertManga): Promise<Manga>;
  getMangaById(id: string): Promise<Manga | null>;
  updateManga(id: string, updates: Partial<Manga>): Promise<Manga | null>;
  searchManga(query: string, limit?: number, offset?: number): Promise<Manga[]>;
  getMangaByContentRating(contentRating: string[], limit?: number, offset?: number): Promise<Manga[]>;
  getPopularManga(limit?: number): Promise<Manga[]>;
  getRecentlyUpdatedManga(limit?: number): Promise<Manga[]>;
  
  // Chapter operations
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  getChapterById(id: string): Promise<Chapter | null>;
  getChaptersByMangaId(mangaId: string): Promise<Chapter[]>;
  updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter | null>;
  
  // Stats operations
  createOrUpdateMangaStats(stats: InsertMangaStats): Promise<MangaStats>;
  getMangaStats(mangaId: string): Promise<MangaStats | null>;
  incrementViews(mangaId: string): Promise<void>;
}

export class MongoStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  // User operations (keeping in-memory for now)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Manga operations
  async createManga(manga: InsertManga): Promise<Manga> {
    try {
      return await mongoDBService.createManga(manga);
    } catch (error) {
      console.log('Using fallback storage for manga creation');
      return await fallbackStorage.createManga(manga);
    }
  }

  async getMangaById(id: string): Promise<Manga | null> {
    try {
      return await mongoDBService.getMangaById(id);
    } catch (error) {
      return await fallbackStorage.getMangaById(id);
    }
  }

  async updateManga(id: string, updates: Partial<Manga>): Promise<Manga | null> {
    try {
      return await mongoDBService.updateManga(id, updates);
    } catch (error) {
      return await fallbackStorage.updateManga(id, updates);
    }
  }

  async searchManga(query: string, limit = 20, offset = 0): Promise<Manga[]> {
    try {
      return await mongoDBService.searchManga(query, limit, offset);
    } catch (error) {
      return await fallbackStorage.searchManga(query, limit, offset);
    }
  }

  async getMangaByContentRating(contentRating: string[], limit = 20, offset = 0): Promise<Manga[]> {
    try {
      return await mongoDBService.getMangaByContentRating(contentRating, limit, offset);
    } catch (error) {
      return await fallbackStorage.getMangaByContentRating(contentRating, limit, offset);
    }
  }

  async getPopularManga(limit = 20): Promise<Manga[]> {
    try {
      return await mongoDBService.getPopularManga(limit);
    } catch (error) {
      return await fallbackStorage.getPopularManga(limit);
    }
  }

  async getRecentlyUpdatedManga(limit = 20): Promise<Manga[]> {
    try {
      return await mongoDBService.getRecentlyUpdatedManga(limit);
    } catch (error) {
      return await fallbackStorage.getRecentlyUpdatedManga(limit);
    }
  }

  // Chapter operations
  async createChapter(chapter: InsertChapter): Promise<Chapter> {
    try {
      return await mongoDBService.createChapter(chapter);
    } catch (error) {
      return await fallbackStorage.createChapter(chapter);
    }
  }

  async getChapterById(id: string): Promise<Chapter | null> {
    try {
      return await mongoDBService.getChapterById(id);
    } catch (error) {
      return await fallbackStorage.getChapterById(id);
    }
  }

  async getChaptersByMangaId(mangaId: string): Promise<Chapter[]> {
    try {
      return await mongoDBService.getChaptersByMangaId(mangaId);
    } catch (error) {
      return await fallbackStorage.getChaptersByMangaId(mangaId);
    }
  }

  async updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter | null> {
    try {
      return await mongoDBService.updateChapter(id, updates);
    } catch (error) {
      return await fallbackStorage.updateChapter(id, updates);
    }
  }

  // Stats operations
  async createOrUpdateMangaStats(stats: InsertMangaStats): Promise<MangaStats> {
    try {
      return await mongoDBService.createOrUpdateMangaStats(stats);
    } catch (error) {
      return await fallbackStorage.createOrUpdateMangaStats(stats);
    }
  }

  async getMangaStats(mangaId: string): Promise<MangaStats | null> {
    try {
      return await mongoDBService.getMangaStats(mangaId);
    } catch (error) {
      return await fallbackStorage.getMangaStats(mangaId);
    }
  }

  async incrementViews(mangaId: string): Promise<void> {
    try {
      await mongoDBService.incrementViews(mangaId);
    } catch (error) {
      await fallbackStorage.incrementViews(mangaId);
    }
  }
}

export const storage = new MongoStorage();
