import type { Manga, Chapter, MangaStats, InsertManga, InsertChapter, InsertMangaStats } from '@shared/schema';

// In-memory fallback storage for development when MongoDB is not available
export class FallbackStorage {
  private manga: Map<string, Manga> = new Map();
  private chapters: Map<string, Chapter> = new Map();
  private stats: Map<string, MangaStats> = new Map();
  private mangaChapters: Map<string, string[]> = new Map(); // mangaId -> chapterIds

  // Manga operations
  async createManga(manga: InsertManga): Promise<Manga> {
    const now = new Date();
    const mangaWithTimestamps: Manga = {
      ...manga,
      createdAt: now,
      updatedAt: now,
    };
    
    this.manga.set(manga.id, mangaWithTimestamps);
    return mangaWithTimestamps;
  }

  async getMangaById(id: string): Promise<Manga | null> {
    return this.manga.get(id) || null;
  }

  async updateManga(id: string, updates: Partial<Manga>): Promise<Manga | null> {
    const existing = this.manga.get(id);
    if (!existing) return null;
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.manga.set(id, updated);
    return updated;
  }

  async searchManga(query: string, limit = 20, offset = 0): Promise<Manga[]> {
    const allManga = Array.from(this.manga.values());
    const filtered = allManga.filter(manga => 
      manga.title.toLowerCase().includes(query.toLowerCase()) ||
      (manga.description && manga.description.toLowerCase().includes(query.toLowerCase())) ||
      (manga.tags && manga.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
    );
    
    return filtered.slice(offset, offset + limit);
  }

  async getMangaByContentRating(contentRating: string[], limit = 20, offset = 0): Promise<Manga[]> {
    const allManga = Array.from(this.manga.values());
    const filtered = allManga.filter(manga => 
      manga.contentRating && contentRating.includes(manga.contentRating)
    );
    
    return filtered.slice(offset, offset + limit);
  }

  async getPopularManga(limit = 20): Promise<Manga[]> {
    // Sort by views from stats
    const allManga = Array.from(this.manga.values());
    const withStats = allManga.map(manga => {
      const stat = this.stats.get(manga.id);
      return { manga, views: stat?.views || 0 };
    });
    
    withStats.sort((a, b) => b.views - a.views);
    return withStats.slice(0, limit).map(item => item.manga);
  }

  async getRecentlyUpdatedManga(limit = 20): Promise<Manga[]> {
    const allManga = Array.from(this.manga.values());
    allManga.sort((a, b) => {
      const aTime = a.lastUpdated?.getTime() || 0;
      const bTime = b.lastUpdated?.getTime() || 0;
      return bTime - aTime;
    });
    
    return allManga.slice(0, limit);
  }

  // Chapter operations
  async createChapter(chapter: InsertChapter): Promise<Chapter> {
    const now = new Date();
    const chapterWithTimestamps: Chapter = {
      ...chapter,
      createdAt: now,
      updatedAt: now,
    };
    
    this.chapters.set(chapter.id, chapterWithTimestamps);
    
    // Update manga chapters mapping
    const existingChapters = this.mangaChapters.get(chapter.mangaId) || [];
    existingChapters.push(chapter.id);
    this.mangaChapters.set(chapter.mangaId, existingChapters);
    
    return chapterWithTimestamps;
  }

  async getChapterById(id: string): Promise<Chapter | null> {
    return this.chapters.get(id) || null;
  }

  async getChaptersByMangaId(mangaId: string): Promise<Chapter[]> {
    const chapterIds = this.mangaChapters.get(mangaId) || [];
    return chapterIds.map(id => this.chapters.get(id)!).filter(Boolean);
  }

  async updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter | null> {
    const existing = this.chapters.get(id);
    if (!existing) return null;
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.chapters.set(id, updated);
    return updated;
  }

  // Stats operations
  async createOrUpdateMangaStats(statsData: InsertMangaStats): Promise<MangaStats> {
    const existing = this.stats.get(statsData.mangaId);
    const stats: MangaStats = existing ? { ...existing, ...statsData } : { id: Date.now(), ...statsData };
    
    this.stats.set(statsData.mangaId, stats);
    return stats;
  }

  async getMangaStats(mangaId: string): Promise<MangaStats | null> {
    return this.stats.get(mangaId) || null;
  }

  async incrementViews(mangaId: string): Promise<void> {
    const existing = this.stats.get(mangaId);
    const stats: MangaStats = existing 
      ? { ...existing, views: (existing.views || 0) + 1, lastViewedAt: new Date() }
      : { id: Date.now(), mangaId, views: 1, rating: null, follows: 0, lastViewedAt: new Date() };
    
    this.stats.set(mangaId, stats);
  }
}

export const fallbackStorage = new FallbackStorage();