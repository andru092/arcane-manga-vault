import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { MangaCard } from "@/components/MangaCard";
import { MangaReader } from "@/components/MangaReader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeProvider } from "next-themes";
import { 
  sampleManga, 
  getFeaturedManga, 
  getPopularManga, 
  getRecentManga, 
  getMangaById, 
  searchManga,
  type MangaData 
} from "@/data/sampleManga";
import { TrendingUp, Clock, Star, BookOpen, Eye } from "lucide-react";

const Index = () => {
  const [isAdultMode, setIsAdultMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedManga, setSelectedManga] = useState<MangaData | null>(null);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("featured");

  // Filter manga based on search and adult mode
  // R mode shows ONLY regular content, A mode shows ONLY adult content
  const filteredManga = searchQuery 
    ? searchManga(searchQuery, isAdultMode)
    : sampleManga.filter(manga => isAdultMode ? manga.isAdult : !manga.isAdult);

  const featuredManga = getFeaturedManga().filter(manga => isAdultMode ? manga.isAdult : !manga.isAdult);
  const popularManga = getPopularManga().filter(manga => isAdultMode ? manga.isAdult : !manga.isAdult);
  const recentManga = getRecentManga().filter(manga => isAdultMode ? manga.isAdult : !manga.isAdult);

  const handleMangaClick = (manga: MangaData) => {
    setSelectedManga(manga);
    setCurrentChapter(1);
    setCurrentPage(1);
  };

  const handleReaderClose = () => {
    setSelectedManga(null);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-background">
        <Header
          isAdultMode={isAdultMode}
          onToggleAdultMode={() => setIsAdultMode(!isAdultMode)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {selectedManga ? (
          <MangaReader
            manga={selectedManga}
            currentChapter={currentChapter}
            currentPage={currentPage}
            onClose={handleReaderClose}
            onChapterChange={setCurrentChapter}
            onPageChange={setCurrentPage}
          />
        ) : (
          <main className="container mx-auto px-4 py-8">
            {/* Hero Section */}
            {!searchQuery && (
              <section className="mb-12">
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-manga-primary to-manga-secondary p-8 text-white">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {isAdultMode ? "Adult Content" : "All Ages"}
                      </Badge>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                      MangaVault
                    </h1>
                    <p className="text-xl md:text-2xl mb-6 text-white/90">
                      Discover thousands of manga with crystal-clear reading experience
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{filteredManga.length}+ Titles</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        <span>4.8+ Average Rating</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>50M+ Views</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                </div>
              </section>
            )}

            {/* Search Results or Browse Tabs */}
            {searchQuery ? (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    Search Results for "{searchQuery}"
                  </h2>
                  <Badge variant="secondary">
                    {filteredManga.length} results
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredManga.map((manga) => (
                    <MangaCard
                      key={manga.id}
                      id={manga.id}
                      title={manga.title}
                      coverImage={manga.coverImage}
                      rating={manga.rating}
                      status={manga.status}
                      chapters={manga.chapters.length}
                      views={manga.views}
                      genres={manga.genres}
                      isAdult={manga.isAdult}
                      lastUpdated={manga.lastUpdated}
                      onClick={() => handleMangaClick(manga)}
                    />
                  ))}
                </div>
              </section>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="featured" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Featured
                  </TabsTrigger>
                  <TabsTrigger value="popular" className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Popular
                  </TabsTrigger>
                  <TabsTrigger value="recent" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="featured" className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Featured Manga</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {featuredManga.map((manga) => (
                        <MangaCard
                          key={manga.id}
                          id={manga.id}
                          title={manga.title}
                          coverImage={manga.coverImage}
                          rating={manga.rating}
                          status={manga.status}
                          chapters={manga.chapters.length}
                          views={manga.views}
                          genres={manga.genres}
                          isAdult={manga.isAdult}
                          lastUpdated={manga.lastUpdated}
                          onClick={() => handleMangaClick(manga)}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="popular" className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Most Popular</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {popularManga.map((manga) => (
                        <MangaCard
                          key={manga.id}
                          id={manga.id}
                          title={manga.title}
                          coverImage={manga.coverImage}
                          rating={manga.rating}
                          status={manga.status}
                          chapters={manga.chapters.length}
                          views={manga.views}
                          genres={manga.genres}
                          isAdult={manga.isAdult}
                          lastUpdated={manga.lastUpdated}
                          onClick={() => handleMangaClick(manga)}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="recent" className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Recently Updated</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {recentManga.map((manga) => (
                        <MangaCard
                          key={manga.id}
                          id={manga.id}
                          title={manga.title}
                          coverImage={manga.coverImage}
                          rating={manga.rating}
                          status={manga.status}
                          chapters={manga.chapters.length}
                          views={manga.views}
                          genres={manga.genres}
                          isAdult={manga.isAdult}
                          lastUpdated={manga.lastUpdated}
                          onClick={() => handleMangaClick(manga)}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {/* Stats Section */}
            <section className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-manga-primary">
                    {formatNumber(filteredManga.length)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Manga</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-manga-primary">
                    {formatNumber(filteredManga.reduce((acc, manga) => acc + manga.chapters.length, 0))}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Chapters</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-manga-primary">
                    {formatNumber(filteredManga.reduce((acc, manga) => acc + manga.views, 0))}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Views</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-manga-primary">
                    {(filteredManga.reduce((acc, manga) => acc + manga.rating, 0) / filteredManga.length).toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Rating</div>
                </CardContent>
              </Card>
            </section>
          </main>
        )}
      </div>
    </ThemeProvider>
  );
};

export default Index;
