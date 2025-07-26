import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Bookmark, 
  Settings, 
  List,
  X,
  Home
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Page {
  id: string;
  imageUrl: string;
  pageNumber: number;
}

interface Chapter {
  id: string;
  number: number;
  title: string;
  pages: Page[];
}

interface MangaReaderProps {
  manga: {
    id: string;
    title: string;
    chapters: Chapter[];
  };
  currentChapter: number;
  currentPage: number;
  onClose: () => void;
  onChapterChange: (chapterNumber: number) => void;
  onPageChange: (pageNumber: number) => void;
}

export function MangaReader({ 
  manga, 
  currentChapter, 
  currentPage, 
  onClose, 
  onChapterChange, 
  onPageChange 
}: MangaReaderProps) {
  const [zoom, setZoom] = useState(100);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showChapterList, setShowChapterList] = useState(false);
  const [readingMode, setReadingMode] = useState<"single" | "double">("single");
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const chapter = manga.chapters.find(c => c.number === currentChapter);
  const totalPages = chapter?.pages.length || 0;
  const currentPageData = chapter?.pages.find(p => p.pageNumber === currentPage);

  // Auto-hide controls
  useEffect(() => {
    const resetTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const handleMouseMove = () => {
      setShowControls(true);
      resetTimeout();
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
      resetTimeout();
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    } else if (currentChapter > 1) {
      const prevChapter = manga.chapters.find(c => c.number === currentChapter - 1);
      if (prevChapter) {
        onChapterChange(currentChapter - 1);
        onPageChange(prevChapter.pages.length);
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    } else {
      const nextChapter = manga.chapters.find(c => c.number === currentChapter + 1);
      if (nextChapter) {
        onChapterChange(currentChapter + 1);
        onPageChange(1);
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        handlePrevPage();
        break;
      case 'ArrowRight':
        handleNextPage();
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, currentChapter]);

  if (!chapter || !currentPageData) {
    return <div>Loading...</div>;
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Top Controls */}
      <div className={`absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <div className="text-white">
              <h2 className="font-semibold text-lg">{manga.title}</h2>
              <p className="text-sm text-white/70">Chapter {currentChapter}: {chapter.title}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`text-white hover:bg-white/20 ${isBookmarked ? 'text-bookmark' : ''}`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowChapterList(!showChapterList)}
              className="text-white hover:bg-white/20"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chapter List Sidebar */}
      {showChapterList && (
        <div className="absolute top-0 right-0 h-full w-80 bg-background border-l z-20 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Chapters</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowChapterList(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {manga.chapters.map((ch) => (
                <Card 
                  key={ch.id}
                  className={`p-3 cursor-pointer hover:bg-manga-surface-hover transition-colors ${
                    ch.number === currentChapter ? 'bg-manga-primary/20 border-manga-primary' : ''
                  }`}
                  onClick={() => {
                    onChapterChange(ch.number);
                    onPageChange(1);
                    setShowChapterList(false);
                  }}
                >
                  <div className="font-medium">Chapter {ch.number}</div>
                  <div className="text-sm text-muted-foreground">{ch.title}</div>
                  <div className="text-xs text-muted-foreground">{ch.pages.length} pages</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Reading Area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div className="relative">
          <img
            src={currentPageData.imageUrl}
            alt={`Page ${currentPage}`}
            className="max-w-full max-h-full object-contain"
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center'
            }}
          />
          
          {/* Navigation Areas */}
          <div 
            className="absolute left-0 top-0 w-1/3 h-full cursor-pointer flex items-center justify-start pl-4"
            onClick={handlePrevPage}
          >
            {showControls && currentPage > 1 && (
              <ChevronLeft className="h-12 w-12 text-white/50 hover:text-white transition-colors" />
            )}
          </div>
          
          <div 
            className="absolute right-0 top-0 w-1/3 h-full cursor-pointer flex items-center justify-end pr-4"
            onClick={handleNextPage}
          >
            {showControls && currentPage < totalPages && (
              <ChevronRight className="h-12 w-12 text-white/50 hover:text-white transition-colors" />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between">
          {/* Page Navigation */}
          <div className="flex items-center gap-4 text-white">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handlePrevPage}
              disabled={currentPage === 1 && currentChapter === 1}
              className="text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2 min-w-[200px]">
              <span className="text-sm">Page</span>
              <Slider
                value={[currentPage]}
                onValueChange={(value) => onPageChange(value[0])}
                max={totalPages}
                min={1}
                step={1}
                className="flex-1"
              />
              <span className="text-sm">{currentPage} / {totalPages}</span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleNextPage}
              disabled={currentPage === totalPages && currentChapter === manga.chapters.length}
              className="text-white hover:bg-white/20"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setZoom(Math.max(50, zoom - 25))}
              className="text-white hover:bg-white/20"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <Badge variant="secondary" className="bg-white/20 text-white min-w-[60px] text-center">
              {zoom}%
            </Badge>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              className="text-white hover:bg-white/20"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setZoom(100)}
              className="text-white hover:bg-white/20"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}