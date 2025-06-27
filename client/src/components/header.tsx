import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Film, 
  Search, 
  Heart, 
  Bookmark, 
  User, 
  ChevronDown,
  Menu,
  X 
} from "lucide-react";

export default function Header() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Fetch watchlist count
  const { data: watchlistData } = useQuery({
    queryKey: ["/api/watchlist"],
    enabled: !!user,
  });

  // Fetch favorites count
  const { data: favoritesData } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: !!user,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Navigate to search results
      console.log("Searching for:", searchQuery);
    }
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cinema-dark/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Film className="h-8 w-8 text-cinema-gold" />
            <h1 className="text-2xl font-display font-bold text-cinema-gold">CineMatch</h1>
          </div>
          
          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder="Search movies, actors, directors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-cinema-gray border-gray-700 text-white placeholder-gray-400 focus:border-cinema-gold pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
          </div>
          
          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <a href="/" className="text-white hover:text-cinema-gold transition-colors">
              Home
            </a>
            <a href="/movies" className="text-gray-400 hover:text-cinema-gold transition-colors">
              Movies
            </a>
            <a href="/trending" className="text-gray-400 hover:text-cinema-gold transition-colors">
              Trending
            </a>
            <a href="/watchlist" className="text-gray-400 hover:text-cinema-gold transition-colors">
              My List
            </a>
          </nav>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Favorites Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-400 hover:text-cinema-gold"
            >
              <Heart className="h-5 w-5" />
              {favoritesData?.total > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {favoritesData.total > 99 ? '99+' : favoritesData.total}
                </Badge>
              )}
            </Button>

            {/* Watchlist Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-400 hover:text-cinema-gold"
            >
              <Bookmark className="h-5 w-5" />
              {watchlistData?.total > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-cinema-gold text-cinema-dark"
                >
                  {watchlistData.total > 99 ? '99+' : watchlistData.total}
                </Badge>
              )}
            </Button>

            {/* User Profile */}
            {user && (
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-white hover:text-cinema-gold"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="User avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-cinema-gray border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-white font-medium">
                        {user.firstName || user.email}
                      </p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      Profile
                    </a>
                    <a
                      href="/preferences"
                      className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      Preferences
                    </a>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-400 hover:text-cinema-gold"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-700 py-4">
            {/* Mobile Search */}
            <div className="mb-4">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-cinema-gray border-gray-700 text-white placeholder-gray-400 focus:border-cinema-gold pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </form>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              <a
                href="/"
                className="block px-3 py-2 text-white hover:text-cinema-gold transition-colors"
              >
                Home
              </a>
              <a
                href="/movies"
                className="block px-3 py-2 text-gray-400 hover:text-cinema-gold transition-colors"
              >
                Movies
              </a>
              <a
                href="/trending"
                className="block px-3 py-2 text-gray-400 hover:text-cinema-gold transition-colors"
              >
                Trending
              </a>
              <a
                href="/watchlist"
                className="block px-3 py-2 text-gray-400 hover:text-cinema-gold transition-colors"
              >
                My List
              </a>
            </nav>
          </div>
        )}
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}
