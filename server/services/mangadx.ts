import axios from 'axios';

const MANGADX_API_BASE = 'https://api.mangadex.org';

export interface MangaDxManga {
  id: string;
  attributes: {
    title: Record<string, string>;
    description: Record<string, string>;
    status: string;
    year: number;
    contentRating: string;
    tags: Array<{
      id: string;
      attributes: {
        name: Record<string, string>;
      };
    }>;
    lastUpdated: string;
  };
  relationships: Array<{
    id: string;
    type: string;
  }>;
}

export interface MangaDxChapter {
  id: string;
  attributes: {
    title: string;
    chapter: string;
    volume: string;
    translatedLanguage: string;
    pages: number;
    publishAt: string;
  };
}

export interface MangaDxCoverArt {
  id: string;
  attributes: {
    fileName: string;
  };
}

export class MangaDxService {
  async searchManga(query: string, limit = 20, offset = 0): Promise<MangaDxManga[]> {
    try {
      const response = await axios.get(`${MANGADX_API_BASE}/manga`, {
        params: {
          title: query,
          limit,
          offset,
          includes: ['cover_art'],
          order: { relevance: 'desc' }
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error searching manga:', error);
      throw error;
    }
  }

  async getMangaById(id: string): Promise<MangaDxManga | null> {
    try {
      const response = await axios.get(`${MANGADX_API_BASE}/manga/${id}`, {
        params: {
          includes: ['cover_art']
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching manga:', error);
      return null;
    }
  }

  async getMangaChapters(mangaId: string, limit = 100, offset = 0): Promise<MangaDxChapter[]> {
    try {
      const response = await axios.get(`${MANGADX_API_BASE}/manga/${mangaId}/feed`, {
        params: {
          limit,
          offset,
          translatedLanguage: ['en'],
          order: { chapter: 'asc' }
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      throw error;
    }
  }

  async getCoverArt(coverId: string): Promise<MangaDxCoverArt | null> {
    try {
      const response = await axios.get(`${MANGADX_API_BASE}/cover/${coverId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching cover art:', error);
      return null;
    }
  }

  async getChapterPages(chapterId: string): Promise<string[]> {
    try {
      const response = await axios.get(`${MANGADX_API_BASE}/at-home/server/${chapterId}`);
      const { baseUrl, chapter } = response.data;
      return chapter.data.map((fileName: string) => `${baseUrl}/data/${chapter.hash}/${fileName}`);
    } catch (error) {
      console.error('Error fetching chapter pages:', error);
      throw error;
    }
  }

  buildCoverUrl(mangaId: string, fileName: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    const sizeMap = {
      small: '256',
      medium: '512', 
      large: 'original'
    };
    return `https://uploads.mangadx.org/covers/${mangaId}/${fileName}.${sizeMap[size]}.jpg`;
  }
}

export const mangaDxService = new MangaDxService();