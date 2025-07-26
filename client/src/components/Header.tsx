import { useState } from "react";
import { Search, Moon, Sun, User, Bookmark, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";

interface HeaderProps {
  isAdultMode: boolean;
  onToggleAdultMode: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ isAdultMode, onToggleAdultMode, searchQuery, onSearchChange }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-6">
          <div className="w-8 h-8 bg-gradient-to-br from-manga-primary to-manga-secondary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-manga-primary to-manga-secondary bg-clip-text text-transparent">
            MangaVault
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-sm mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search manga..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {/* Adult Content Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleAdultMode}
            className={`font-bold ${
              isAdultMode 
                ? 'bg-adult text-white border-adult hover:bg-adult/90' 
                : 'border-manga-primary text-manga-primary hover:bg-manga-primary hover:text-white'
            }`}
          >
            {isAdultMode ? 'A' : 'R'}
          </Button>

          <Button variant="ghost" size="sm">
            <Bookmark className="h-4 w-4 mr-2" />
            Bookmarks
          </Button>

          <Button variant="ghost" size="sm">
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleAdultMode}
              className={`w-full font-bold ${
                isAdultMode 
                  ? 'bg-adult text-white border-adult' 
                  : 'border-manga-primary text-manga-primary'
              }`}
            >
              {isAdultMode ? 'Adult Mode (A)' : 'Regular Mode (R)'}
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmarks
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              Toggle Theme
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}