import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Plus, Play, Calendar, Clock } from "lucide-react";
import type { Movie } from "@shared/schema";

interface MovieCardProps {
  movie: Movie;
  onClick?: () => void;
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageError, setImageError] = useState(false);

  // Fetch watchlist status
  const { data: watchlistStatus } = useQuery({
    queryKey: [`/api/watchlist/${movie.id}/status`],
    enabled: !!user,
  });

  // Fetch favorite status
  const { data: favoriteStatus } = useQuery({
    queryKey: [`/api/favorites/${movie.id}/status`],
    enabled: !!user,
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

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (watchlistStatus?.inWatchlist) {
      removeFromWatchlistMutation.mutate();
    } else {
      addToWatchlistMutation.mutate();
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favoriteStatus?.inFavorites) {
      removeFromFavoritesMutation.mutate();
    } else {
      addToFavoritesMutation.mutate();
    }
  };

  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath || imageError) return null;
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  const formatRuntime = (runtime: number | null) => {
    if (!runtime) return null;
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const posterUrl = getPosterUrl(movie.posterPath);

  return (
    <div 
      className="group cursor-pointer transition-all duration-300 hover:transform hover:scale-105"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-xl bg-cinema-gray">
        {/* Movie Poster */}
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-72 bg-cinema-gray flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Rating and Actions */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-cinema-gold">
                <Star className="h-4 w-4 mr-1 fill-current" />
                <span className="font-semibold text-sm">{movie.voteAverage}</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                  onClick={handleWatchlistToggle}
                  disabled={addToWatchlistMutation.isPending || removeFromWatchlistMutation.isPending}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                  onClick={handleFavoriteToggle}
                  disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
                >
                  <Heart className={`h-4 w-4 ${favoriteStatus?.inFavorites ? 'fill-current text-red-500' : ''}`} />
                </Button>
              </div>
            </div>
            
            {/* Movie Info */}
            <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">{movie.title}</h3>
            
            {/* Metadata */}
            <div className="flex items-center text-gray-300 text-xs mb-2 gap-2">
              {movie.releaseDate && (
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{new Date(movie.releaseDate).getFullYear()}</span>
                </div>
              )}
              {movie.runtime && (
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {movie.genres.slice(0, 2).map((genre) => (
                  <Badge key={genre.id} variant="secondary" className="text-xs px-1 py-0">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Watch Trailer Button */}
            <Button
              size="sm"
              className="w-full bg-cinema-gold hover:bg-cinema-accent text-cinema-dark text-xs font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
            >
              <Play className="h-3 w-3 mr-1" />
              View Details
            </Button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {watchlistStatus?.inWatchlist && (
            <Badge className="bg-cinema-gold text-cinema-dark text-xs">
              Watchlist
            </Badge>
          )}
          {favoriteStatus?.inFavorites && (
            <Badge variant="destructive" className="text-xs">
              ❤️ Favorite
            </Badge>
          )}
        </div>
      </div>
      
      {/* Movie Title Below Card */}
      <div className="mt-3">
        <h3 className="font-semibold text-white group-hover:text-cinema-gold transition-colors line-clamp-1">
          {movie.title}
        </h3>
        <div className="flex items-center text-gray-400 text-sm mt-1 gap-2">
          {movie.releaseDate && (
            <span>{new Date(movie.releaseDate).getFullYear()}</span>
          )}
          {movie.runtime && (
            <>
              <span>•</span>
              <span>{formatRuntime(movie.runtime)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
