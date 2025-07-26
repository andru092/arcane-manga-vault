import { MongoClient, Db, Collection } from 'mongodb';
import type { Manga, Chapter, MangaStats, InsertManga, InsertChapter, InsertMangaStats } from '@shared/schema';

export class MongoDBService {
  private client: MongoClient;
  private db: Db | null = null;

  constructor() {
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/mangavault';
    this.client = new MongoClient(connectionString);
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db();
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      console.log('MongoDB is not available. Please set MONGODB_URI environment variable for production use.');
      // Don't throw error to allow app to continue with in-memory fallback
    }
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  private getCollection<T extends Document>(name: string): Collection<T> {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db.collection<T>(name);
  }

  // Manga operations
  async createManga(manga: InsertManga): Promise<Manga> {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    const collection = this.getCollection<any>('manga');
    const now = new Date();
    const mangaWithTimestamps = {
      ...manga,
      createdAt: now,
      updatedAt: now,
    };
    
    await collection.insertOne(mangaWithTimestamps);
    return mangaWithTimestamps;
  }

  async getMangaById(id: string): Promise<Manga | null> {
    if (!this.db) return null;
    const collection = this.getCollection<any>('manga');
    return await collection.findOne({ id });
  }

  async updateManga(id: string, updates: Partial<Manga>): Promise<Manga | null> {
    const collection = this.getCollection<Manga>('manga');
    const result = await collection.findOneAndUpdate(
      { id },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  async searchManga(query: string, limit = 20, offset = 0): Promise<Manga[]> {
    const collection = this.getCollection<Manga>('manga');
    return await collection.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $elemMatch: { $regex: query, $options: 'i' } } }
      ]
    })
    .skip(offset)
    .limit(limit)
    .toArray();
  }

  async getMangaByContentRating(contentRating: string[], limit = 20, offset = 0): Promise<Manga[]> {
    const collection = this.getCollection<Manga>('manga');
    return await collection.find({
      contentRating: { $in: contentRating }
    })
    .skip(offset)
    .limit(limit)
    .toArray();
  }

  // Chapter operations
  async createChapter(chapter: InsertChapter): Promise<Chapter> {
    const collection = this.getCollection<Chapter>('chapters');
    const now = new Date();
    const chapterWithTimestamps = {
      ...chapter,
      createdAt: now,
      updatedAt: now,
    };
    
    await collection.insertOne(chapterWithTimestamps);
    return chapterWithTimestamps;
  }

  async getChapterById(id: string): Promise<Chapter | null> {
    const collection = this.getCollection<Chapter>('chapters');
    return await collection.findOne({ id });
  }

  async getChaptersByMangaId(mangaId: string): Promise<Chapter[]> {
    const collection = this.getCollection<Chapter>('chapters');
    return await collection.find({ mangaId })
      .sort({ chapterNumber: 1 })
      .toArray();
  }

  async updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter | null> {
    const collection = this.getCollection<Chapter>('chapters');
    const result = await collection.findOneAndUpdate(
      { id },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  // Stats operations
  async createOrUpdateMangaStats(stats: InsertMangaStats): Promise<MangaStats> {
    const collection = this.getCollection<MangaStats>('manga_stats');
    const existing = await collection.findOne({ mangaId: stats.mangaId });
    
    if (existing) {
      const result = await collection.findOneAndUpdate(
        { mangaId: stats.mangaId },
        { $set: stats },
        { returnDocument: 'after' }
      );
      return result.value!;
    } else {
      await collection.insertOne(stats);
      return stats;
    }
  }

  async getMangaStats(mangaId: string): Promise<MangaStats | null> {
    const collection = this.getCollection<MangaStats>('manga_stats');
    return await collection.findOne({ mangaId });
  }

  async incrementViews(mangaId: string): Promise<void> {
    const collection = this.getCollection<MangaStats>('manga_stats');
    await collection.updateOne(
      { mangaId },
      { 
        $inc: { views: 1 },
        $set: { lastViewedAt: new Date() }
      },
      { upsert: true }
    );
  }

  // Aggregation queries
  async getPopularManga(limit = 20): Promise<Manga[]> {
    const statsCollection = this.getCollection<MangaStats>('manga_stats');
    const mangaCollection = this.getCollection<Manga>('manga');
    
    const popularMangaIds = await statsCollection.find({})
      .sort({ views: -1 })
      .limit(limit)
      .toArray();
    
    const mangaIds = popularMangaIds.map(stat => stat.mangaId);
    return await mangaCollection.find({ id: { $in: mangaIds } }).toArray();
  }

  async getRecentlyUpdatedManga(limit = 20): Promise<Manga[]> {
    const collection = this.getCollection<Manga>('manga');
    return await collection.find({})
      .sort({ lastUpdated: -1 })
      .limit(limit)
      .toArray();
  }
}

export const mongoDBService = new MongoDBService();