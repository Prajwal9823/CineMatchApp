import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { tmdbService, type TMDBMovie } from "./services/tmdb";
import { movieFilterSchema, insertMovieSchema, insertWatchlistSchema, insertFavoriteSchema, insertRatingSchema, insertUserPreferencesSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Movie routes
  app.get('/api/movies', async (req, res) => {
    try {
      const filters = movieFilterSchema.parse(req.query);
      const result = await storage.getMovies(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).json({ message: "Failed to fetch movies" });
    }
  });

  app.get('/api/movies/search', async (req, res) => {
    try {
      const { q: query, page = 1, limit = 20 } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const result = await storage.searchMovies(query, Number(page), Number(limit));
      res.json(result);
    } catch (error) {
      console.error("Error searching movies:", error);
      res.status(500).json({ message: "Failed to search movies" });
    }
  });

  app.get('/api/movies/trending', async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const movies = await storage.getTrendingMovies(Number(limit));
      res.json(movies);
    } catch (error) {
      console.error("Error fetching trending movies:", error);
      res.status(500).json({ message: "Failed to fetch trending movies" });
    }
  });

  app.get('/api/movies/:id', async (req, res) => {
    try {
      const movieId = parseInt(req.params.id);
      const movie = await storage.getMovieById(movieId);
      
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      res.json(movie);
    } catch (error) {
      console.error("Error fetching movie:", error);
      res.status(500).json({ message: "Failed to fetch movie" });
    }
  });

  app.get('/api/movies/:id/trailer', async (req, res) => {
    try {
      const movieId = parseInt(req.params.id);
      const movie = await storage.getMovieById(movieId);
      
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      const trailerUrl = await tmdbService.getYouTubeEmbedUrl(movie.tmdbId);
      res.json({ trailerUrl });
    } catch (error) {
      console.error("Error fetching movie trailer:", error);
      res.status(500).json({ message: "Failed to fetch movie trailer" });
    }
  });

  // TMDB sync routes
  app.post('/api/tmdb/sync/popular', async (req, res) => {
    try {
      const { page = 1 } = req.body;
      const tmdbMovies = await tmdbService.getPopularMovies(page);
      
      const syncedMovies = [];
      for (const tmdbMovie of tmdbMovies.results) {
        let movie = await storage.getMovieByTmdbId(tmdbMovie.id);
        
        if (!movie) {
          const movieDetails = await tmdbService.getMovieDetails(tmdbMovie.id);
          movie = await storage.createMovie({
            tmdbId: movieDetails.id,
            title: movieDetails.title,
            overview: movieDetails.overview,
            posterPath: movieDetails.poster_path,
            backdropPath: movieDetails.backdrop_path,
            releaseDate: movieDetails.release_date,
            runtime: movieDetails.runtime,
            voteAverage: movieDetails.vote_average.toString(),
            voteCount: movieDetails.vote_count,
            genres: movieDetails.genres,
            originalLanguage: movieDetails.original_language,
            adult: movieDetails.adult,
            popularity: movieDetails.popularity.toString(),
          });
        }
        syncedMovies.push(movie);
      }
      
      res.json({ syncedMovies, total: tmdbMovies.total_results });
    } catch (error) {
      console.error("Error syncing popular movies:", error);
      res.status(500).json({ message: "Failed to sync popular movies" });
    }
  });

  app.post('/api/tmdb/sync/trending', async (req, res) => {
    try {
      const tmdbMovies = await tmdbService.getTrendingMovies();
      
      const syncedMovies = [];
      for (const tmdbMovie of tmdbMovies.results) {
        let movie = await storage.getMovieByTmdbId(tmdbMovie.id);
        
        if (!movie) {
          const movieDetails = await tmdbService.getMovieDetails(tmdbMovie.id);
          movie = await storage.createMovie({
            tmdbId: movieDetails.id,
            title: movieDetails.title,
            overview: movieDetails.overview,
            posterPath: movieDetails.poster_path,
            backdropPath: movieDetails.backdrop_path,
            releaseDate: movieDetails.release_date,
            runtime: movieDetails.runtime,
            voteAverage: movieDetails.vote_average.toString(),
            voteCount: movieDetails.vote_count,
            genres: movieDetails.genres,
            originalLanguage: movieDetails.original_language,
            adult: movieDetails.adult,
            popularity: movieDetails.popularity.toString(),
          });
        }
        syncedMovies.push(movie);
      }
      
      res.json({ syncedMovies, total: tmdbMovies.total_results });
    } catch (error) {
      console.error("Error syncing trending movies:", error);
      res.status(500).json({ message: "Failed to sync trending movies" });
    }
  });

  app.post('/api/tmdb/sync/bollywood', async (req, res) => {
    try {
      // Search for popular Hindi/Bollywood movies
      const bollywoodMovies = await tmdbService.discoverMovies({
        with_original_language: 'hi',
        sort_by: 'popularity.desc',
        page: 1
      });
      
      const syncedMovies = [];
      for (const tmdbMovie of bollywoodMovies.results) {
        let movie = await storage.getMovieByTmdbId(tmdbMovie.id);
        
        if (!movie) {
          const movieDetails = await tmdbService.getMovieDetails(tmdbMovie.id);
          movie = await storage.createMovie({
            tmdbId: movieDetails.id,
            title: movieDetails.title,
            overview: movieDetails.overview,
            posterPath: movieDetails.poster_path,
            backdropPath: movieDetails.backdrop_path,
            releaseDate: movieDetails.release_date,
            runtime: movieDetails.runtime,
            voteAverage: movieDetails.vote_average.toString(),
            voteCount: movieDetails.vote_count,
            genres: movieDetails.genres,
            originalLanguage: movieDetails.original_language,
            adult: movieDetails.adult,
            popularity: movieDetails.popularity.toString(),
          });
        }
        syncedMovies.push(movie);
      }
      
      res.json({ syncedMovies, total: bollywoodMovies.total_results });
    } catch (error) {
      console.error("Error syncing Bollywood movies:", error);
      res.status(500).json({ message: "Failed to sync Bollywood movies" });
    }
  });

  // Watchlist routes
  app.get('/api/watchlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { page = 1, limit = 20 } = req.query;
      const result = await storage.getUserWatchlist(userId, Number(page), Number(limit));
      res.json(result);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  app.post('/api/watchlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { movieId } = insertWatchlistSchema.parse({ ...req.body, userId });
      
      const watchlistItem = await storage.addToWatchlist(userId, movieId);
      res.json(watchlistItem);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      res.status(500).json({ message: "Failed to add to watchlist" });
    }
  });

  app.delete('/api/watchlist/:movieId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const movieId = parseInt(req.params.movieId);
      
      await storage.removeFromWatchlist(userId, movieId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      res.status(500).json({ message: "Failed to remove from watchlist" });
    }
  });

  app.get('/api/watchlist/:movieId/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const movieId = parseInt(req.params.movieId);
      
      const inWatchlist = await storage.isInWatchlist(userId, movieId);
      res.json({ inWatchlist });
    } catch (error) {
      console.error("Error checking watchlist status:", error);
      res.status(500).json({ message: "Failed to check watchlist status" });
    }
  });

  // Favorites routes
  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { page = 1, limit = 20 } = req.query;
      const result = await storage.getUserFavorites(userId, Number(page), Number(limit));
      res.json(result);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { movieId } = insertFavoriteSchema.parse({ ...req.body, userId });
      
      const favoriteItem = await storage.addToFavorites(userId, movieId);
      res.json(favoriteItem);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  app.delete('/api/favorites/:movieId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const movieId = parseInt(req.params.movieId);
      
      await storage.removeFromFavorites(userId, movieId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  app.get('/api/favorites/:movieId/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const movieId = parseInt(req.params.movieId);
      
      const inFavorites = await storage.isInFavorites(userId, movieId);
      res.json({ inFavorites });
    } catch (error) {
      console.error("Error checking favorites status:", error);
      res.status(500).json({ message: "Failed to check favorites status" });
    }
  });

  // Rating routes
  app.post('/api/ratings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { movieId, rating } = insertRatingSchema.parse({ ...req.body, userId });
      
      const ratingItem = await storage.rateMovie(userId, movieId, Number(rating));
      res.json(ratingItem);
    } catch (error) {
      console.error("Error rating movie:", error);
      res.status(500).json({ message: "Failed to rate movie" });
    }
  });

  app.get('/api/ratings/:movieId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const movieId = parseInt(req.params.movieId);
      
      const rating = await storage.getUserRating(userId, movieId);
      res.json(rating || null);
    } catch (error) {
      console.error("Error fetching rating:", error);
      res.status(500).json({ message: "Failed to fetch rating" });
    }
  });

  // User preferences routes
  app.get('/api/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences || null);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.post('/api/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = insertUserPreferencesSchema.parse({ ...req.body, userId });
      
      const updatedPreferences = await storage.updateUserPreferences(userId, preferences);
      res.json(updatedPreferences);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // TMDB genres route
  app.get('/api/genres', async (req, res) => {
    try {
      const genres = await tmdbService.getGenres();
      res.json(genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
      res.status(500).json({ message: "Failed to fetch genres" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
