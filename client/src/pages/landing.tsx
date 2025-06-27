import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Film, Star, Heart, Bookmark, Play, Search } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cinema-dark via-cinema-gray to-cinema-dark">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-dark/90 to-cinema-gray/90"></div>
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="flex justify-center mb-6">
            <Film className="h-16 w-16 text-cinema-gold" />
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6">
            Cine<span className="text-cinema-gold">Match</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover your perfect movie with advanced filtering, personalized recommendations, 
            and smart movie discovery powered by AI
          </p>
          <Button 
            size="lg" 
            className="bg-cinema-gold hover:bg-cinema-accent text-cinema-dark font-semibold px-8 py-4 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            Start Discovering Movies
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Why Choose CineMatch?
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Advanced movie discovery features designed for true cinema enthusiasts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-cinema-gray border-gray-700 hover:border-cinema-gold transition-colors">
            <CardContent className="p-6 text-center">
              <Search className="h-12 w-12 text-cinema-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Advanced Filtering</h3>
              <p className="text-gray-400">
                Filter by genre, region, release year, IMDb rating, duration, and age rating 
                to find exactly what you're looking for
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cinema-gray border-gray-700 hover:border-cinema-gold transition-colors">
            <CardContent className="p-6 text-center">
              <Star className="h-12 w-12 text-cinema-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Personalized Recommendations</h3>
              <p className="text-gray-400">
                AI-powered recommendations based on your viewing history, 
                ratings, and preferences for a truly personalized experience
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cinema-gray border-gray-700 hover:border-cinema-gold transition-colors">
            <CardContent className="p-6 text-center">
              <Heart className="h-12 w-12 text-cinema-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Watchlist & Favorites</h3>
              <p className="text-gray-400">
                Save movies to your watchlist, mark favorites, and rate films 
                to build your personal movie collection
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cinema-gray border-gray-700 hover:border-cinema-gold transition-colors">
            <CardContent className="p-6 text-center">
              <Play className="h-12 w-12 text-cinema-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Trailer Integration</h3>
              <p className="text-gray-400">
                Watch trailers directly within the app with YouTube integration 
                to preview movies before adding to your list
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cinema-gray border-gray-700 hover:border-cinema-gold transition-colors">
            <CardContent className="p-6 text-center">
              <Bookmark className="h-12 w-12 text-cinema-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Multi-Region Support</h3>
              <p className="text-gray-400">
                Discover movies from Hollywood, Bollywood, Korean cinema, Anime, 
                and more with comprehensive global coverage
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cinema-gray border-gray-700 hover:border-cinema-gold transition-colors">
            <CardContent className="p-6 text-center">
              <Film className="h-12 w-12 text-cinema-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Trending & Popular</h3>
              <p className="text-gray-400">
                Stay updated with trending movies, box office hits, 
                and critically acclaimed films from around the world
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-cinema-gray border-t border-gray-700">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Ready to Find Your Next Favorite Movie?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of movie enthusiasts who trust CineMatch for personalized movie discovery
          </p>
          <Button 
            size="lg" 
            className="bg-cinema-gold hover:bg-cinema-accent text-cinema-dark font-semibold px-8 py-4 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </div>
  );
}
