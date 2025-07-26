// Sample manga data for demonstration
export interface MangaData {
  id: string;
  title: string;
  coverImage: string;
  rating: number;
  status: "ongoing" | "completed" | "hiatus";
  chapters: Array<{
    id: string;
    number: number;
    title: string;
    pages: Array<{
      id: string;
      imageUrl: string;
      pageNumber: number;
    }>;
  }>;
  views: number;
  genres: string[];
  isAdult: boolean;
  lastUpdated: string;
  description: string;
  author: string;
  artist: string;
}

// Generate sample pages for chapters
const generatePages = (chapterNumber: number, pageCount: number) => {
  return Array.from({ length: pageCount }, (_, i) => ({
    id: `page-${chapterNumber}-${i + 1}`,
    imageUrl: `https://picsum.photos/800/1200?random=${chapterNumber * 100 + i + 1}`,
    pageNumber: i + 1,
  }));
};

export const sampleManga: MangaData[] = [
  {
    id: "1",
    title: "Dragon's Awakening",
    coverImage: "https://picsum.photos/300/400?random=1",
    rating: 4.8,
    status: "ongoing",
    chapters: [
      {
        id: "ch-1-1",
        number: 1,
        title: "The Beginning",
        pages: generatePages(1, 24),
      },
      {
        id: "ch-1-2",
        number: 2,
        title: "First Encounter",
        pages: generatePages(2, 22),
      },
      {
        id: "ch-1-3",
        number: 3,
        title: "Power Revealed",
        pages: generatePages(3, 26),
      },
    ],
    views: 2500000,
    genres: ["Action", "Fantasy", "Adventure"],
    isAdult: false,
    lastUpdated: "2h ago",
    description: "A young warrior discovers an ancient dragon's power within himself.",
    author: "Akira Yamamoto",
    artist: "Akira Yamamoto",
  },
  {
    id: "2",
    title: "Midnight Romance",
    coverImage: "https://picsum.photos/300/400?random=2",
    rating: 4.6,
    status: "ongoing",
    chapters: [
      {
        id: "ch-2-1",
        number: 1,
        title: "First Meeting",
        pages: generatePages(11, 20),
      },
      {
        id: "ch-2-2",
        number: 2,
        title: "Unexpected Feelings",
        pages: generatePages(12, 18),
      },
    ],
    views: 1800000,
    genres: ["Romance", "Drama", "Slice of Life"],
    isAdult: true,
    lastUpdated: "1d ago",
    description: "A mature romance story between two professionals.",
    author: "Yuki Tanaka",
    artist: "Miki Sato",
  },
  {
    id: "3",
    title: "Space Odyssey",
    coverImage: "https://picsum.photos/300/400?random=3",
    rating: 4.9,
    status: "completed",
    chapters: [
      {
        id: "ch-3-1",
        number: 1,
        title: "Launch",
        pages: generatePages(21, 25),
      },
      {
        id: "ch-3-2",
        number: 2,
        title: "First Contact",
        pages: generatePages(22, 23),
      },
      {
        id: "ch-3-3",
        number: 3,
        title: "The Truth",
        pages: generatePages(23, 27),
      },
    ],
    views: 5200000,
    genres: ["Sci-Fi", "Action", "Mystery"],
    isAdult: false,
    lastUpdated: "3d ago",
    description: "Humanity's first journey to the stars reveals shocking truths.",
    author: "Hiroshi Nakamura",
    artist: "Kenji Watanabe",
  },
  {
    id: "4",
    title: "Forbidden Love",
    coverImage: "https://picsum.photos/300/400?random=4",
    rating: 4.3,
    status: "hiatus",
    chapters: [
      {
        id: "ch-4-1",
        number: 1,
        title: "Forbidden Meeting",
        pages: generatePages(31, 19),
      },
    ],
    views: 950000,
    genres: ["Romance", "Drama", "Adult"],
    isAdult: true,
    lastUpdated: "1w ago",
    description: "A forbidden romance that challenges societal norms.",
    author: "Emi Yoshida",
    artist: "Emi Yoshida",
  },
  {
    id: "5",
    title: "Mystic Academy",
    coverImage: "https://picsum.photos/300/400?random=5",
    rating: 4.7,
    status: "ongoing",
    chapters: [
      {
        id: "ch-5-1",
        number: 1,
        title: "Enrollment",
        pages: generatePages(41, 22),
      },
      {
        id: "ch-5-2",
        number: 2,
        title: "First Lesson",
        pages: generatePages(42, 21),
      },
    ],
    views: 3100000,
    genres: ["Fantasy", "School", "Magic"],
    isAdult: false,
    lastUpdated: "5h ago",
    description: "Students learn magic in a prestigious academy.",
    author: "Kazuki Nishimura",
    artist: "Aya Kimura",
  },
  {
    id: "6",
    title: "Dark Desires",
    coverImage: "https://picsum.photos/300/400?random=6",
    rating: 4.1,
    status: "ongoing",
    chapters: [
      {
        id: "ch-6-1",
        number: 1,
        title: "Awakening",
        pages: generatePages(51, 16),
      },
    ],
    views: 720000,
    genres: ["Adult", "Supernatural", "Romance"],
    isAdult: true,
    lastUpdated: "2d ago",
    description: "Supernatural beings explore their dark desires.",
    author: "Rei Matsumoto",
    artist: "Saki Hayashi",
  },
];

export const getFeaturedManga = () => sampleManga.slice(0, 3);
export const getPopularManga = () => [...sampleManga].sort((a, b) => b.views - a.views);
export const getRecentManga = () => [...sampleManga].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
export const getMangaById = (id: string) => sampleManga.find(manga => manga.id === id);
export const searchManga = (query: string, isAdultMode: boolean) => {
  const filtered = sampleManga.filter(manga => {
    const matchesQuery = manga.title.toLowerCase().includes(query.toLowerCase()) ||
                        manga.genres.some(genre => genre.toLowerCase().includes(query.toLowerCase())) ||
                        manga.author.toLowerCase().includes(query.toLowerCase());
    
    // When in adult mode (A), show ONLY adult content
    // When in regular mode (R), show ONLY non-adult content
    const matchesMode = isAdultMode ? manga.isAdult : !manga.isAdult;
    
    return matchesQuery && matchesMode;
  });
  
  return filtered;
};