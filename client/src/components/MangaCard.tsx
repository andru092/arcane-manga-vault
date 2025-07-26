import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, BookOpen, Eye } from "lucide-react";

interface MangaCardProps {
  id: string;
  title: string;
  coverImage: string;
  rating: number;
  status: "ongoing" | "completed" | "hiatus";
  chapters: number;
  views: number;
  genres: string[];
  isAdult: boolean;
  lastUpdated: string;
  onClick: () => void;
}

export function MangaCard({
  title,
  coverImage,
  rating,
  status,
  chapters,
  views,
  genres,
  isAdult,
  lastUpdated,
  onClick,
}: MangaCardProps) {
  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const statusColors = {
    ongoing: "bg-green-500",
    completed: "bg-blue-500",
    hiatus: "bg-yellow-500",
  };

  return (
    <Card 
      className="group cursor-pointer overflow-hidden border-0 bg-manga-surface hover:bg-manga-surface-hover transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Adult Content Indicator */}
          {isAdult && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive" className="bg-adult text-white">
                18+
              </Badge>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} title={status} />
          </div>

          {/* Rating & Views Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{formatViews(views)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 space-y-2">
          {/* Title */}
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-manga-primary transition-colors">
            {title}
          </h3>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{chapters} ch</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{lastUpdated}</span>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-1">
            {genres.slice(0, 2).map((genre) => (
              <Badge 
                key={genre} 
                variant="secondary" 
                className="text-xs px-2 py-0 text-muted-foreground"
              >
                {genre}
              </Badge>
            ))}
            {genres.length > 2 && (
              <Badge variant="secondary" className="text-xs px-2 py-0 text-muted-foreground">
                +{genres.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}