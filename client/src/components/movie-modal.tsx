import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Star, Heart, Plus, Play, Calendar, Clock, Globe, X } from "lucide-react";
import type { Movie } from "@shared/schema";

interface MovieModalProps {
  movie: Movie;
  onClose: () => void;
}

export default function MovieModal({ movie, onClose }: MovieModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTrailer, setShowTrailer] = useState(false);

  // Fetch trailer URL
  const { data: trailerData } = useQuery({
    queryKey: [`/api/movies/${movie.id}/trailer`],
    enabled: !!user && !!movie,
  });

  // Fetch watchlist status
  const { data: watchlistStatus } = useQuery({
    queryKey: [`/api/watchlist/${movie.id}/status`],
    enabled: !!user && !!movie,
  });

  // Fetch favorite status
  const { data: favoriteStatus } = useQuery({
    queryKey: [`/api/favorites/${movie.id}/status`],
    enabled: !!user && !!movie,
  });

  // Fetch user rating
  const { data: userRating } = useQuery({
    queryKey: [`/api/ratings/${movie.id}`],
    enabled: !!user && !!movie,
  });

  // Add to watchlist mutation
  const addToWatchlistMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/watchlist", { movieId: movie.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/watchlist/${movie.id}/status`] });
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({
        title: "Added to Watchlist",
        description: `${movie.title} has been added to your watchlist.`,
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
      await apiRequest("DELETE", `/api/watchlist/${movie.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/watchlist/${movie.id}/status`] });
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({
        title: "Removed from Watchlist",
        description: `${movie.title} has been removed from your watchlist.`,
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
      await apiRequest("POST", "/api/favorites", { movieId: movie.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${movie.id}/status`] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Added to Favorites",
        description: `${movie.title} has been added to your favorites.`,
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
      await apiRequest("DELETE", `/api/favorites/${movie.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${movie.id}/status`] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removed from Favorites",
        description: `${movie.title} has been removed from your favorites.`,
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
      await apiRequest("POST", "/api/ratings", { movieId: movie.id, rating });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ratings/${movie.id}`] });
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

  const formatRuntime = (runtime: number | null) => {
    if (!runtime) return null;
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 backdrop-blur-sm">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="relative bg-cinema-gray rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* Modal Content */}
            <div className="relative">
              {/* Movie Backdrop */}
              <div className="relative h-64 md:h-80">
                {movie.backdropPath ? (
                  <img
                    src={getBackdropUrl(movie.backdropPath)!}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-cinema-dark flex items-center justify-center">
                    <span className="text-gray-400">No Backdrop Available</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-cinema-gray via-transparent to-transparent"></div>
                
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
              
              {/* Movie Info */}
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  
                  {/* Movie Poster */}
                  <div className="flex-shrink-0">
                    {movie.posterPath ? (
                      <img
                        src={getPosterUrl(movie.posterPath)!}
                        alt={movie.title}
                        className="w-32 md:w-40 h-48 md:h-60 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-32 md:w-40 h-48 md:h-60 bg-cinema-dark rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Movie Details */}
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center text-cinema-gold mr-4">
                        <Star className="h-5 w-5 mr-1 fill-current" />
                        <span className="font-semibold">{movie.voteAverage}</span>
                        <span className="text-gray-400 ml-1">({movie.voteCount} votes)</span>
                      </div>
                      {movie.adult && (
                        <Badge variant="destructive" className="text-xs">18+</Badge>
                      )}
                    </div>
                    
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">{movie.title}</h1>
                    
                    <div className="flex flex-wrap items-center text-gray-400 text-sm mb-4 gap-4">
                      {movie.releaseDate && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{new Date(movie.releaseDate).getFullYear()}</span>
                        </div>
                      )}
                      {movie.runtime && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{formatRuntime(movie.runtime)}</span>
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
                      <div className="flex flex-wrap gap-2 mb-4">
                        {movie.genres.map((genre) => (
                          <Badge key={genre.id} variant="secondary" className="text-xs">
                            {genre.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
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
                        className="bg-cinema-gray hover:bg-gray-600 text-white border-gray-600"
                        onClick={handleWatchlistToggle}
                        disabled={addToWatchlistMutation.isPending || removeFromWatchlistMutation.isPending}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {watchlistStatus?.inWatchlist ? "Remove from List" : "Add to List"}
                      </Button>
                      <Button
                        variant="outline"
                        className="bg-cinema-gray hover:bg-gray-600 text-white border-gray-600"
                        onClick={handleFavoriteToggle}
                        disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${favoriteStatus?.inFavorites ? 'fill-current text-red-500' : ''}`} />
                        {favoriteStatus?.inFavorites ? "Remove from Favorites" : "Like"}
                      </Button>
                    </div>
                    
                    {/* User Rating */}
                    <div className="border-t border-gray-700 pt-4">
                      <h3 className="text-sm font-semibold text-gray-300 mb-2">Rate this movie</h3>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => handleRating(rating)}
                            className="transition-colors hover:text-cinema-gold"
                            disabled={rateMovieMutation.isPending}
                          >
                            <Star
                              className={`h-5 w-5 ${
                                userRating && Number(userRating.rating) >= rating
                                  ? 'fill-cinema-gold text-cinema-gold'
                                  : 'text-gray-400'
                              }`}
                            />
                          </button>
                        ))}
                        {userRating && (
                          <span className="ml-2 text-cinema-gold font-semibold text-sm">
                            {userRating.rating}/5
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && trailerData?.trailerUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative w-full max-w-4xl mx-4 aspect-video">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <iframe
              src={trailerData.trailerUrl}
              title={`${movie.title} Trailer`}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
