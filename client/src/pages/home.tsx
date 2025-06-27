import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import FilterSidebar from "@/components/filter-sidebar";
import MovieCard from "@/components/movie-card";
import TrendingSection from "@/components/trending-section";
import MovieModal from "@/components/movie-modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronUp, Filter } from "lucide-react";
import type { Movie, MovieFilter } from "@shared/schema";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<MovieFilter>({
    page: 1,
    limit: 20,
    sortBy: "popularity",
    sortOrder: "desc"
  });
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  // Fetch movies
  const { data: moviesData, isLoading: moviesLoading } = useQuery({
    queryKey: ["/api/movies", filters],
    enabled: !!user,
  });

  // Fetch trending movies
  const { data: trendingMovies } = useQuery({
    queryKey: ["/api/movies/trending"],
    enabled: !!user,
  });

  // Sync trending movies on first load
  const syncTrendingMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/tmdb/sync/trending");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies/trending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      console.error("Error syncing trending movies:", error);
    },
  });

  // Sync popular movies
  const syncPopularMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/tmdb/sync/popular", { page: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",  
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      console.error("Error syncing popular movies:", error);
    },
  });

  // Initialize movie data
  useEffect(() => {
    if (user && (!moviesData?.movies || moviesData.movies.length === 0)) {
      syncPopularMutation.mutate();
    }
    if (user && (!trendingMovies || trendingMovies.length === 0)) {
      syncTrendingMutation.mutate();
    }
  }, [user, moviesData, trendingMovies]);

  const handleFilterChange = (newFilters: Partial<MovieFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleLoadMore = () => {
    setFilters(prev => ({ ...prev, page: prev.page! + 1 }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cinema-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinema-gold mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-cinema-dark text-white">
      <Header />
      
      <div className="pt-16 flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <FilterSidebar 
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Mobile Filter Overlay */}
        {showFilters && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
            <div className="absolute left-0 top-16 bottom-0 w-80 bg-cinema-gray">
              <FilterSidebar 
                filters={filters}
                onFilterChange={handleFilterChange}
                onClose={() => setShowFilters(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          {/* Hero Section */}
          <section className="relative h-96 mb-8">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1489599735188-3ee5d6c2e9d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600')`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cinema-dark/90 to-cinema-gray/50"></div>
            </div>
            
            <div className="relative z-10 h-full flex items-center px-6 lg:px-12">
              <div className="max-w-lg">
                <div className="flex items-center mb-2">
                  <span className="bg-cinema-gold text-cinema-dark px-2 py-1 rounded-full text-xs font-semibold mr-2">
                    WELCOME BACK
                  </span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-display font-bold mb-3">
                  Welcome to CineMatch
                </h2>
                <p className="text-gray-200 mb-6 leading-relaxed">
                  Discover your next favorite movie with personalized recommendations and advanced filtering.
                </p>
                <div className="flex items-center space-x-4">
                  <Button 
                    className="bg-cinema-gold hover:bg-cinema-accent text-cinema-dark"
                    onClick={() => {
                      const moviesSection = document.getElementById('movies-section');
                      moviesSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Explore Movies
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <div className="px-6 lg:px-12">
            {/* Trending Section */}
            {trendingMovies && trendingMovies.length > 0 && (
              <TrendingSection 
                movies={trendingMovies} 
                onMovieClick={setSelectedMovie}
              />
            )}

            {/* Movies Section */}
            <section id="movies-section" className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white">Discover Movies</h2>
                  <p className="text-gray-400 mt-1">
                    {moviesData ? `Showing ${moviesData.movies?.length || 0} of ${moviesData.total || 0} movies` : 'Loading...'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <select 
                    className="bg-cinema-gray border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-cinema-gold"
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-') as [any, any];
                      handleFilterChange({ sortBy, sortOrder });
                    }}
                  >
                    <option value="popularity-desc">Sort by Popularity</option>
                    <option value="vote_average-desc">Sort by Rating</option>
                    <option value="release_date-desc">Sort by Release Date</option>
                    <option value="title-asc">Sort by Title</option>
                  </select>
                </div>
              </div>

              {/* Movie Grid */}
              {moviesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-72 w-full bg-cinema-gray" />
                      <Skeleton className="h-4 w-3/4 bg-cinema-gray" />
                      <Skeleton className="h-3 w-1/2 bg-cinema-gray" />
                    </div>
                  ))}
                </div>
              ) : moviesData?.movies && moviesData.movies.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
                    {moviesData.movies.map((movie) => (
                      <MovieCard 
                        key={movie.id} 
                        movie={movie} 
                        onClick={() => setSelectedMovie(movie)}
                      />
                    ))}
                  </div>
                  
                  {/* Load More Button */}
                  {moviesData.movies.length < moviesData.total && (
                    <div className="text-center mb-12">
                      <Button 
                        variant="outline"
                        className="bg-cinema-gray hover:bg-gray-700 text-white border-gray-600 hover:border-cinema-gold"
                        onClick={handleLoadMore}
                      >
                        Load More Movies
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No movies found. Try adjusting your filters.</p>
                </div>
              )}
            </section>
          </div>
        </main>

        {/* Movie Detail Modal */}
        {selectedMovie && (
          <MovieModal 
            movie={selectedMovie} 
            onClose={() => setSelectedMovie(null)}
          />
        )}

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
          {/* Filter Toggle (Mobile) */}
          <Button
            size="icon"
            className="lg:hidden h-14 w-14 bg-cinema-gold hover:bg-cinema-accent text-cinema-dark rounded-full shadow-lg"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-5 w-5" />
          </Button>
          
          {/* Scroll to Top */}
          <Button
            size="icon"
            variant="outline"
            className="h-14 w-14 bg-cinema-gray hover:bg-gray-600 text-white rounded-full shadow-lg border-gray-600"
            onClick={scrollToTop}
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
