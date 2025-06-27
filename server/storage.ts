import {
  users,
  movies,
  watchlist,
  favorites,
  ratings,
  userPreferences,
  type User,
  type UpsertUser,
  type Movie,
  type InsertMovie,
  type Watchlist,
  type InsertWatchlist,
  type Favorite,  
  type InsertFavorite,
  type Rating,
  type InsertRating,
  type UserPreferences,
  type InsertUserPreferences,
  type MovieFilter
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, asc, gte, lte, inArray, like, or } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Movie operations
  getMovieByTmdbId(tmdbId: number): Promise<Movie | undefined>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: number, movie: Partial<InsertMovie>): Promise<Movie>;
  getMovies(filters: MovieFilter): Promise<{ movies: Movie[]; total: number }>;
  getMovieById(id: number): Promise<Movie | undefined>;
  searchMovies(query: string, page?: number, limit?: number): Promise<{ movies: Movie[]; total: number }>;
  getTrendingMovies(limit?: number): Promise<Movie[]>;
  
  // Watchlist operations
  addToWatchlist(userId: string, movieId: number): Promise<Watchlist>;
  removeFromWatchlist(userId: string, movieId: number): Promise<void>;
  getUserWatchlist(userId: string, page?: number, limit?: number): Promise<{ movies: Movie[]; total: number }>;
  isInWatchlist(userId: string, movieId: number): Promise<boolean>;
  
  // Favorites operations
  addToFavorites(userId: string, movieId: number): Promise<Favorite>;
  removeFromFavorites(userId: string, movieId: number): Promise<void>;
  getUserFavorites(userId: string, page?: number, limit?: number): Promise<{ movies: Movie[]; total: number }>;
  isInFavorites(userId: string, movieId: number): Promise<boolean>;
  
  // Rating operations
  rateMovie(userId: string, movieId: number, rating: number): Promise<Rating>;
  getUserRating(userId: string, movieId: number): Promise<Rating | undefined>;
  getUserRatings(userId: string): Promise<Rating[]>;
  
  // User preferences
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  updateUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Movie operations
  async getMovieByTmdbId(tmdbId: number): Promise<Movie | undefined> {
    const [movie] = await db.select().from(movies).where(eq(movies.tmdbId, tmdbId));
    return movie;
  }

  async createMovie(movie: InsertMovie): Promise<Movie> {
    const [createdMovie] = await db.insert(movies).values(movie).returning();
    return createdMovie;
  }

  async updateMovie(id: number, movie: Partial<InsertMovie>): Promise<Movie> {
    const [updatedMovie] = await db
      .update(movies)
      .set({ ...movie, updatedAt: new Date() })
      .where(eq(movies.id, id))
      .returning();
    return updatedMovie;
  }

  async getMovies(filters: MovieFilter): Promise<{ movies: Movie[]; total: number }> {
    let query = db.select().from(movies);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(movies);
    
    const conditions = [];
    
    if (filters.genres && filters.genres.length > 0) {
      const genreConditions = filters.genres.map(genreId => 
        sql`JSON_SEARCH(${movies.genres}, 'one', ${genreId}, NULL, '$[*].id') IS NOT NULL`
      );
      conditions.push(or(...genreConditions));
    }
    
    if (filters.releaseYearFrom) {
      conditions.push(gte(sql`YEAR(${movies.releaseDate})`, filters.releaseYearFrom));
    }
    
    if (filters.releaseYearTo) {
      conditions.push(lte(sql`YEAR(${movies.releaseDate})`, filters.releaseYearTo));
    }
    
    if (filters.ratingMin) {
      conditions.push(gte(movies.voteAverage, filters.ratingMin.toString()));
    }
    
    if (filters.ratingMax) {
      conditions.push(lte(movies.voteAverage, filters.ratingMax.toString()));
    }
    
    if (filters.runtime && filters.runtime !== "any") {
      switch (filters.runtime) {
        case "under90":
          conditions.push(sql`${movies.runtime} < 90`);
          break;
        case "90to120":
          conditions.push(and(gte(movies.runtime, 90), lte(movies.runtime, 120)));
          break;
        case "over120":
          conditions.push(sql`${movies.runtime} > 120`);
          break;
      }
    }

    if (conditions.length > 0) {
      const whereCondition = and(...conditions);
      query = query.where(whereCondition);
      countQuery = countQuery.where(whereCondition);
    }
    
    // Sorting
    const sortBy = filters.sortBy || "popularity";
    const sortOrder = filters.sortOrder || "desc";
    
    switch (sortBy) {
      case "rating":
        query = sortOrder === "desc" ? query.orderBy(desc(movies.voteAverage)) : query.orderBy(asc(movies.voteAverage));
        break;
      case "release_date":
        query = sortOrder === "desc" ? query.orderBy(desc(movies.releaseDate)) : query.orderBy(asc(movies.releaseDate));
        break;
      case "title":
        query = sortOrder === "desc" ? query.orderBy(desc(movies.title)) : query.orderBy(asc(movies.title));
        break;
      default:
        query = sortOrder === "desc" ? query.orderBy(desc(movies.popularity)) : query.orderBy(asc(movies.popularity));
    }
    
    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    
    query = query.limit(limit).offset(offset);
    
    const [moviesResult, countResult] = await Promise.all([
      query,
      countQuery
    ]);
    
    return {
      movies: moviesResult,
      total: countResult[0]?.count || 0
    };
  }

  async getMovieById(id: number): Promise<Movie | undefined> {
    const [movie] = await db.select().from(movies).where(eq(movies.id, id));
    return movie;
  }

  async searchMovies(query: string, page = 1, limit = 20): Promise<{ movies: Movie[]; total: number }> {
    const offset = (page - 1) * limit;
    const searchCondition = or(
      like(movies.title, `%${query}%`),
      like(movies.overview, `%${query}%`)
    );
    
    const [moviesResult, countResult] = await Promise.all([
      db.select().from(movies)
        .where(searchCondition)
        .orderBy(desc(movies.popularity))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(movies)
        .where(searchCondition)
    ]);
    
    return {
      movies: moviesResult,
      total: countResult[0]?.count || 0
    };
  }

  async getTrendingMovies(limit = 10): Promise<Movie[]> {
    return await db.select().from(movies)
      .orderBy(desc(movies.popularity))
      .limit(limit);
  }

  // Watchlist operations
  async addToWatchlist(userId: string, movieId: number): Promise<Watchlist> {
    const [watchlistItem] = await db
      .insert(watchlist)
      .values({ userId, movieId })
      .onConflictDoNothing()
      .returning();
    return watchlistItem;
  }

  async removeFromWatchlist(userId: string, movieId: number): Promise<void> {
    await db
      .delete(watchlist)
      .where(and(eq(watchlist.userId, userId), eq(watchlist.movieId, movieId)));
  }

  async getUserWatchlist(userId: string, page = 1, limit = 20): Promise<{ movies: Movie[]; total: number }> {
    const offset = (page - 1) * limit;
    
    const [moviesResult, countResult] = await Promise.all([
      db.select({ movie: movies })
        .from(watchlist)
        .innerJoin(movies, eq(watchlist.movieId, movies.id))
        .where(eq(watchlist.userId, userId))
        .orderBy(desc(watchlist.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(watchlist)
        .where(eq(watchlist.userId, userId))
    ]);
    
    return {
      movies: moviesResult.map(row => row.movie),
      total: countResult[0]?.count || 0
    };
  }

  async isInWatchlist(userId: string, movieId: number): Promise<boolean> {
    const [item] = await db
      .select()
      .from(watchlist)
      .where(and(eq(watchlist.userId, userId), eq(watchlist.movieId, movieId)));
    return !!item;
  }

  // Favorites operations
  async addToFavorites(userId: string, movieId: number): Promise<Favorite> {
    const [favoriteItem] = await db
      .insert(favorites)
      .values({ userId, movieId })
      .onConflictDoNothing()
      .returning();
    return favoriteItem;
  }

  async removeFromFavorites(userId: string, movieId: number): Promise<void> {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.movieId, movieId)));
  }

  async getUserFavorites(userId: string, page = 1, limit = 20): Promise<{ movies: Movie[]; total: number }> {
    const offset = (page - 1) * limit;
    
    const [moviesResult, countResult] = await Promise.all([
      db.select({ movie: movies })
        .from(favorites)
        .innerJoin(movies, eq(favorites.movieId, movies.id))
        .where(eq(favorites.userId, userId))
        .orderBy(desc(favorites.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(favorites)
        .where(eq(favorites.userId, userId))
    ]);
    
    return {
      movies: moviesResult.map(row => row.movie),
      total: countResult[0]?.count || 0
    };
  }

  async isInFavorites(userId: string, movieId: number): Promise<boolean> {
    const [item] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.movieId, movieId)));
    return !!item;
  }

  // Rating operations
  async rateMovie(userId: string, movieId: number, rating: number): Promise<Rating> {
    const [ratingItem] = await db
      .insert(ratings)
      .values({ userId, movieId, rating: rating.toString() })
      .onConflictDoUpdate({
        target: [ratings.userId, ratings.movieId],
        set: { rating: rating.toString(), updatedAt: new Date() }
      })
      .returning();
    return ratingItem;
  }

  async getUserRating(userId: string, movieId: number): Promise<Rating | undefined> {
    const [rating] = await db
      .select()
      .from(ratings)
      .where(and(eq(ratings.userId, userId), eq(ratings.movieId, movieId)));
    return rating;
  }

  async getUserRatings(userId: string): Promise<Rating[]> {
    return await db
      .select()
      .from(ratings)
      .where(eq(ratings.userId, userId))
      .orderBy(desc(ratings.updatedAt));
  }

  // User preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return preferences;
  }

  async updateUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const [updatedPreferences] = await db
      .insert(userPreferences)
      .values({ userId, ...preferences })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: { ...preferences, updatedAt: new Date() }
      })
      .returning();
    return updatedPreferences;
  }
}

export const storage = new DatabaseStorage();
