import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Play } from "lucide-react";
import type { Movie } from "@shared/schema";

interface TrendingSectionProps {
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
}

export default function TrendingSection({ movies, onMovieClick }: TrendingSectionProps) {
  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  const formatRuntime = (runtime: number | null) => {
    if (!runtime) return null;
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-white flex items-center">
          <span className="text-cinema-red mr-3">🔥</span>
          Trending Now
        </h2>
        <a href="/trending" className="text-cinema-gold hover:text-cinema-accent transition-colors">
          View All
        </a>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {movies.slice(0, 4).map((movie, index) => (
          <div 
            key={movie.id} 
            className="group cursor-pointer relative transition-all duration-300 hover:transform hover:scale-105"
            onClick={() => onMovieClick(movie)}
          >
            {/* Trending Badge */}
            <div className="absolute top-2 left-2 z-10">
              <Badge className="bg-cinema-red text-white text-xs font-semibold animate-pulse">
                #{index + 1}
              </Badge>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-cinema-gray">
              {/* Movie Poster */}
              {movie.posterPath ? (
                <img
                  src={getPosterUrl(movie.posterPath)!}
                  alt={movie.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-48 bg-cinema-gray flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No Image</span>
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-cinema-gold">
                      <Star className="h-4 w-4 mr-1 fill-current" />
                      <span className="font-semibold text-sm">{movie.voteAverage}</span>
                    </div>
                    <Button
                      size="sm"
                      className="bg-cinema-gold hover:bg-cinema-accent text-cinema-dark text-xs font-semibold px-3 py-1"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Play
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Movie Info */}
            <div className="mt-3">
              <h3 className="font-semibold text-white group-hover:text-cinema-gold transition-colors line-clamp-1">
                {movie.title}
              </h3>
              <div className="flex items-center text-gray-400 text-sm mt-1 gap-2">
                {movie.releaseDate && (
                  <span>{new Date(movie.releaseDate).getFullYear()}</span>
                )}
                {movie.genres && movie.genres.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{movie.genres[0].name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
