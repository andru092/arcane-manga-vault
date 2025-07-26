import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mongoDBService } from "./services/mongodb";
import { mangaDxService } from "./services/mangadx";
import { s3Service } from "./services/s3";
import { insertMangaSchema, insertChapterSchema } from "@shared/schema";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize MongoDB connection (will fail gracefully if not available)
  await mongoDBService.connect();

  // Search manga from MangaDx and store in MongoDB
  app.get("/api/manga/search", async (req, res) => {
    try {
      const { q, limit = 20, offset = 0 } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Search query is required" });
      }

      // First search in our database
      const localResults = await storage.searchManga(q, Number(limit), Number(offset));
      
      if (localResults.length > 0) {
        return res.json({ data: localResults, source: 'local' });
      }

      // If no local results, search MangaDx
      const mangaDxResults = await mangaDxService.searchManga(q, Number(limit), Number(offset));
      
      // Process and store manga from MangaDx
      const processedManga = [];
      for (const mangaDxManga of mangaDxResults) {
        const coverArt = mangaDxManga.relationships.find(rel => rel.type === 'cover_art');
        let coverImageUrl = null;
        let coverImageS3Key = null;

        if (coverArt) {
          const coverData = await mangaDxService.getCoverArt(coverArt.id);
          if (coverData) {
            coverImageUrl = mangaDxService.buildCoverUrl(mangaDxManga.id, coverData.attributes.fileName);
            
            // Download and store cover image in S3
            try {
              const coverResponse = await axios.get(coverImageUrl, { responseType: 'arraybuffer' });
              coverImageS3Key = await s3Service.uploadCoverImage(
                mangaDxManga.id, 
                Buffer.from(coverResponse.data),
                'image/jpeg'
              );
            } catch (error) {
              console.error('Error storing cover image:', error);
            }
          }
        }

        const manga = {
          id: mangaDxManga.id,
          title: mangaDxManga.attributes.title.en || Object.values(mangaDxManga.attributes.title)[0],
          description: mangaDxManga.attributes.description.en || Object.values(mangaDxManga.attributes.description)[0] || null,
          status: mangaDxManga.attributes.status,
          year: mangaDxManga.attributes.year,
          contentRating: mangaDxManga.attributes.contentRating,
          tags: mangaDxManga.attributes.tags.map(tag => tag.attributes.name.en || Object.values(tag.attributes.name)[0]),
          coverImageUrl,
          coverImageS3Key,
          lastUpdated: new Date(mangaDxManga.attributes.lastUpdated),
        };

        try {
          const storedManga = await storage.createManga(manga);
          processedManga.push(storedManga);
        } catch (error) {
          console.error('Error storing manga:', error);
          processedManga.push(manga);
        }
      }

      res.json({ data: processedManga, source: 'mangadx' });
    } catch (error) {
      console.error('Error searching manga:', error);
      res.status(500).json({ error: "Failed to search manga" });
    }
  });

  // Get manga by ID
  app.get("/api/manga/:id", async (req, res) => {
    try {
      const { id } = req.params;
      let manga = await storage.getMangaById(id);

      if (!manga) {
        // Try to fetch from MangaDx
        const mangaDxManga = await mangaDxService.getMangaById(id);
        if (mangaDxManga) {
          // Process and store as above
          const coverArt = mangaDxManga.relationships.find(rel => rel.type === 'cover_art');
          let coverImageUrl = null;
          let coverImageS3Key = null;

          if (coverArt) {
            const coverData = await mangaDxService.getCoverArt(coverArt.id);
            if (coverData) {
              coverImageUrl = mangaDxService.buildCoverUrl(mangaDxManga.id, coverData.attributes.fileName);
              
              try {
                const coverResponse = await axios.get(coverImageUrl, { responseType: 'arraybuffer' });
                coverImageS3Key = await s3Service.uploadCoverImage(
                  mangaDxManga.id, 
                  Buffer.from(coverResponse.data),
                  'image/jpeg'
                );
              } catch (error) {
                console.error('Error storing cover image:', error);
              }
            }
          }

          manga = await storage.createManga({
            id: mangaDxManga.id,
            title: mangaDxManga.attributes.title.en || Object.values(mangaDxManga.attributes.title)[0],
            description: mangaDxManga.attributes.description.en || Object.values(mangaDxManga.attributes.description)[0] || null,
            status: mangaDxManga.attributes.status,
            year: mangaDxManga.attributes.year,
            contentRating: mangaDxManga.attributes.contentRating,
            tags: mangaDxManga.attributes.tags.map(tag => tag.attributes.name.en || Object.values(tag.attributes.name)[0]),
            coverImageUrl,
            coverImageS3Key,
            lastUpdated: new Date(mangaDxManga.attributes.lastUpdated),
          });
        }
      }

      if (!manga) {
        return res.status(404).json({ error: "Manga not found" });
      }

      // Increment view count
      await storage.incrementViews(manga.id);

      res.json(manga);
    } catch (error) {
      console.error('Error fetching manga:', error);
      res.status(500).json({ error: "Failed to fetch manga" });
    }
  });

  // Get manga chapters
  app.get("/api/manga/:id/chapters", async (req, res) => {
    try {
      const { id } = req.params;
      let chapters = await storage.getChaptersByMangaId(id);

      if (chapters.length === 0) {
        // Fetch from MangaDx
        const mangaDxChapters = await mangaDxService.getMangaChapters(id);
        
        for (const mangaDxChapter of mangaDxChapters) {
          try {
            const chapter = await storage.createChapter({
              id: mangaDxChapter.id,
              mangaId: id,
              title: mangaDxChapter.attributes.title || null,
              chapterNumber: mangaDxChapter.attributes.chapter,
              volumeNumber: mangaDxChapter.attributes.volume || null,
              language: mangaDxChapter.attributes.translatedLanguage,
              pageCount: mangaDxChapter.attributes.pages,
              s3BaseKey: `manga/${id}/chapters/${mangaDxChapter.id}`,
              publishedAt: new Date(mangaDxChapter.attributes.publishAt),
            });
            chapters.push(chapter);
          } catch (error) {
            console.error('Error storing chapter:', error);
          }
        }
      }

      res.json(chapters);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      res.status(500).json({ error: "Failed to fetch chapters" });
    }
  });

  // Get chapter pages (returns S3 signed URLs)
  app.get("/api/chapters/:id/pages", async (req, res) => {
    try {
      const { id } = req.params;
      const chapter = await storage.getChapterById(id);

      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }

      // Check if pages are already stored in S3
      const pageUrls = [];
      let pagesStored = true;

      for (let i = 1; i <= (chapter.pageCount || 0); i++) {
        const s3Key = s3Service.generateMangaPageKey(chapter.mangaId, chapter.id, i);
        const exists = await s3Service.checkObjectExists(s3Key);
        
        if (exists) {
          const signedUrl = await s3Service.getSignedUrl(s3Key);
          pageUrls.push(signedUrl);
        } else {
          pagesStored = false;
          break;
        }
      }

      if (pagesStored && pageUrls.length > 0) {
        return res.json({ pages: pageUrls, source: 's3' });
      }

      // If pages not in S3, fetch from MangaDx and store
      const mangaDxPages = await mangaDxService.getChapterPages(id);
      const storedPageUrls = [];

      for (let i = 0; i < mangaDxPages.length; i++) {
        try {
          const pageResponse = await axios.get(mangaDxPages[i], { responseType: 'arraybuffer' });
          const s3Key = await s3Service.uploadMangaPage(
            chapter.mangaId,
            chapter.id,
            i + 1,
            Buffer.from(pageResponse.data),
            'image/jpeg'
          );
          
          const signedUrl = await s3Service.getSignedUrl(s3Key);
          storedPageUrls.push(signedUrl);
        } catch (error) {
          console.error(`Error storing page ${i + 1}:`, error);
          // Fallback to original MangaDx URL
          storedPageUrls.push(mangaDxPages[i]);
        }
      }

      res.json({ pages: storedPageUrls, source: 'mangadx' });
    } catch (error) {
      console.error('Error fetching chapter pages:', error);
      res.status(500).json({ error: "Failed to fetch chapter pages" });
    }
  });

  // Get popular manga
  app.get("/api/manga/popular", async (req, res) => {
    try {
      const { limit = 20 } = req.query;
      const manga = await storage.getPopularManga(Number(limit));
      res.json(manga);
    } catch (error) {
      console.error('Error fetching popular manga:', error);
      res.status(500).json({ error: "Failed to fetch popular manga" });
    }
  });

  // Get recently updated manga
  app.get("/api/manga/recent", async (req, res) => {
    try {
      const { limit = 20 } = req.query;
      const manga = await storage.getRecentlyUpdatedManga(Number(limit));
      res.json(manga);
    } catch (error) {
      console.error('Error fetching recent manga:', error);
      res.status(500).json({ error: "Failed to fetch recent manga" });
    }
  });

  // Get manga by content rating
  app.get("/api/manga/by-rating", async (req, res) => {
    try {
      const { ratings, limit = 20, offset = 0 } = req.query;
      
      if (!ratings) {
        return res.status(400).json({ error: "Content ratings are required" });
      }

      const ratingArray = Array.isArray(ratings) ? ratings : [ratings];
      const manga = await storage.getMangaByContentRating(ratingArray as string[], Number(limit), Number(offset));
      res.json(manga);
    } catch (error) {
      console.error('Error fetching manga by rating:', error);
      res.status(500).json({ error: "Failed to fetch manga by content rating" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
