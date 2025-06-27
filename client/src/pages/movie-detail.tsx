import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Heart, Plus, Play, Calendar, Clock, Globe } from "lucide-react";
import type { Movie } from "@shared/schema";

interface MovieDetailProps {
  movieId: string;
}

export default function MovieDetail({ movieId }: MovieDetailProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTrailer, setShowTrailer] = useState(false);

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

  // Fetch movie details
  const { data: movie, isLoading: movieLoading } = useQuery({
    queryKey: [`/api/movies/${movieId}`],
    enabled: !!user && !!movieId,
  });

  // Fetch trailer URL
  const { data: trailerData } = useQuery({
    queryKey: [`/api/movies/${movieId}/trailer`],
    enabled: !!user && !!movieId,
  });

  // Fetch watchlist status
  const { data: watchlistStatus } = useQuery({
    queryKey: [`/api/watchlist/${movieId}/status`],
    enabled: !!user && !!movieId,
  });

  // Fetch favorite status
  const { data: favoriteStatus } = useQuery({
    queryKey: [`/api/favorites/${movieId}/status`],
    enabled: !!user && !!movieId,
  });

  // Fetch user rating
  const { data: userRating } = useQuery({
    queryKey: [`/api/ratings/${movieId}`],
    enabled: !!user && !!movieId,
  });

  // Add to watchlist mutation
  const addToWatchlistMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/watchlist", { movieId: parseInt(movieId) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/watchlist/${movieId}/status`] });
      toast({
        title: "Added to Watchlist",
        description: "Movie has been added to your watchlist.",
      });
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
      toast({
        title: "Error",
        description: "Failed to add movie to watchlist.",
        variant: "destructive",
      });
    },
  });

  // Remove from watchlist mutation
  const removeFromWatchlistMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/watchlist/${movieId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/watchlist/${movieId}/status`] });
      toast({
        title: "Removed from Watchlist",
        description: "Movie has been removed from your watchlist.",
      });
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
      toast({
        title: "Error",
        description: "Failed to remove movie from watchlist.",
        variant: "destructive",
      });
    },
  });

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/favorites", { movieId: parseInt(movieId) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${movieId}/status`] });
      toast({
        title: "Added to Favorites",
        description: "Movie has been added to your favorites.",
      });
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
      toast({
        title: "Error",
        description: "Failed to add movie to favorites.",
        variant: "destructive",
      });
    },
  });

  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/favorites/${movieId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${movieId}/status`] });
      toast({
        title: "Removed from Favorites",
        description: "Movie has been removed from your favorites.",
      });
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
      toast({
        title: "Error",
        description: "Failed to remove movie from favorites.",
        variant: "destructive",
      });
    },
  });

  // Rate movie mutation
  const rateMovieMutation = useMutation({
    mutationFn: async (rating: number) => {
      await apiRequest("POST", "/api/ratings", { movieId: parseInt(movieId), rating });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ratings/${movieId}`] });
      toast({
        title: "Rating Saved",
        description: "Your rating has been saved.",
      });
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
      toast({
        title: "Error",
        description: "Failed to save rating.",
        variant: "destructive",
      });
    },
  });

  const handleWatchlistToggle = () => {
    if (watchlistStatus?.inWatchlist) {
      removeFromWatchlistMutation.mutate();
    } else {
      addToWatchlistMutation.mutate();
    }
  };

  const handleFavoriteToggle = () => {
    if (favoriteStatus?.inFavorites) {
      removeFromFavoritesMutation.mutate();
    } else {
      addToFavoritesMutation.mutate();
    }
  };

  const handleRating = (rating: number) => {
    rateMovieMutation.mutate(rating);
  };

  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  const getBackdropUrl = (backdropPath: string | null) => {
    if (!backdropPath) return null;
    return `https://image.tmdb.org/t/p/w1280${backdropPath}`;
  };

  if (authLoading || movieLoading) {
    return (
      <div className="min-h-screen bg-cinema-dark text-white">
        <Header />
        <div className="pt-16">
          <div className="relative h-96">
            <Skeleton className="w-full h-full bg-cinema-gray" />
          </div>
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
              <Skeleton className="w-48 h-72 bg-cinema-gray" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-3/4 bg-cinema-gray" />
                <Skeleton className="h-4 w-1/2 bg-cinema-gray" />
                <Skeleton className="h-20 w-full bg-cinema-gray" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !movie) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cinema-dark text-white">
      <Header />
      
      <div className="pt-16">
        {/* Hero Section */}
        <div className="relative h-96 md:h-[500px]">
          {movie.backdropPath && (
            <img
              src={getBackdropUrl(movie.backdropPath)!}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-dark via-cinema-dark/50 to-transparent"></div>
          
          {/* Play Button Overlay */}
          {trailerData?.trailerUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="lg"
                className="w-20 h-20 bg-cinema-gold hover:bg-cinema-accent rounded-full text-cinema-dark hover:scale-105 transition-transform"
                onClick={() => setShowTrailer(true)}
              >
                <Play className="h-8 w-8 ml-1" />
              </Button>
            </div>
          )}
        </div>

        {/* Movie Details */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Movie Poster */}
            <div className="flex-shrink-0">
              {movie.posterPath ? (
                <img
                  src={getPosterUrl(movie.posterPath)!}
                  alt={movie.title}
                  className="w-48 md:w-64 h-auto rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-48 md:w-64 h-72 bg-cinema-gray rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>

            {/* Movie Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center text-cinema-gold">
                  <Star className="h-5 w-5 mr-1 fill-current" />
                  <span className="font-semibold text-lg">{movie.voteAverage}</span>
                  <span className="text-gray-400 ml-1">({movie.voteCount} votes)</span>
                </div>
                {movie.adult && (
                  <Badge variant="destructive">18+</Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">{movie.title}</h1>

              <div className="flex flex-wrap items-center text-gray-400 gap-4 mb-6">
                {movie.releaseDate && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(movie.releaseDate).getFullYear()}</span>
                  </div>
                )}
                {movie.runtime && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                  </div>
                )}
                {movie.originalLanguage && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    <span>{movie.originalLanguage.toUpperCase()}</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map((genre) => (
                    <Badge key={genre.id} variant="secondary">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Overview */}
              {movie.overview && (
                <p className="text-gray-300 leading-relaxed mb-6">{movie.overview}</p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                {trailerData?.trailerUrl && (
                  <Button
                    className="bg-cinema-gold hover:bg-cinema-accent text-cinema-dark"
                    onClick={() => setShowTrailer(true)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Watch Trailer
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="border-gray-600 hover:border-cinema-gold"
                  onClick={handleWatchlistToggle}
                  disabled={addToWatchlistMutation.isPending || removeFromWatchlistMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {watchlistStatus?.inWatchlist ? "Remove from List" : "Add to List"}
                </Button>

                <Button
                  variant="outline"
                  className="border-gray-600 hover:border-cinema-gold"
                  onClick={handleFavoriteToggle}
                  disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
                >
                  <Heart className={`h-4 w-4 mr-2 ${favoriteStatus?.inFavorites ? 'fill-current text-red-500' : ''}`} />
                  {favoriteStatus?.inFavorites ? "Remove from Favorites" : "Add to Favorites"}
                </Button>
              </div>

              {/* User Rating */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold mb-3">Rate this movie</h3>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRating(rating)}
                      className="transition-colors hover:text-cinema-gold"
                      disabled={rateMovieMutation.isPending}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          userRating && Number(userRating.rating) >= rating
                            ? 'fill-cinema-gold text-cinema-gold'
                            : 'text-gray-400'
                        }`}
                      />
                    </button>
                  ))}
                  {userRating && (
                    <span className="ml-2 text-cinema-gold font-semibold">
                      {userRating.rating}/5
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && trailerData?.trailerUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full max-w-4xl mx-4">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              ✕
            </button>
            <div className="relative pt-9/16">
              <iframe
                src={trailerData.trailerUrl}
                title={`${movie.title} Trailer`}
                className="absolute inset-0 w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
