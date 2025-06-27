import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
  decimal,
  serial
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Movies table
export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  tmdbId: integer("tmdb_id").unique().notNull(),
  title: varchar("title").notNull(),
  overview: text("overview"),
  posterPath: varchar("poster_path"),
  backdropPath: varchar("backdrop_path"),
  releaseDate: varchar("release_date"),
  runtime: integer("runtime"),
  voteAverage: decimal("vote_average", { precision: 3, scale: 1 }),
  voteCount: integer("vote_count"),
  genres: jsonb("genres").$type<Array<{ id: number; name: string }>>(),
  originalLanguage: varchar("original_language"),
  adult: boolean("adult").default(false),
  popularity: decimal("popularity", { precision: 10, scale: 3 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User watchlist
export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  movieId: integer("movie_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User favorites/liked movies
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  movieId: integer("movie_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User movie ratings
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  movieId: integer("movie_id").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User preferences
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").unique().notNull(),
  preferredGenres: jsonb("preferred_genres").$type<number[]>(),
  preferredLanguages: jsonb("preferred_languages").$type<string[]>(),
  ageRating: varchar("age_rating"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  watchlist: many(watchlist),
  favorites: many(favorites),
  ratings: many(ratings),
  preferences: many(userPreferences),
}));

export const moviesRelations = relations(movies, ({ many }) => ({
  watchlist: many(watchlist),
  favorites: many(favorites),
  ratings: many(ratings),
}));

export const watchlistRelations = relations(watchlist, ({ one }) => ({
  user: one(users, {
    fields: [watchlist.userId],
    references: [users.id],
  }),
  movie: one(movies, {
    fields: [watchlist.movieId],
    references: [movies.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  movie: one(movies, {
    fields: [favorites.movieId],
    references: [movies.id],
  }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
  movie: one(movies, {
    fields: [ratings.movieId],
    references: [movies.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertMovieSchema = createInsertSchema(movies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWatchlistSchema = createInsertSchema(watchlist).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Movie = typeof movies.$inferSelect;
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Watchlist = typeof watchlist.$inferSelect;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

// Filter types
export const movieFilterSchema = z.object({
  genres: z.array(z.number()).optional(),
  regions: z.array(z.string()).optional(),
  releaseYearFrom: z.number().optional(),
  releaseYearTo: z.number().optional(),
  ratingMin: z.number().optional(),
  ratingMax: z.number().optional(),
  runtime: z.enum(["any", "under90", "90to120", "over120"]).optional(),
  ageRating: z.array(z.string()).optional(),
  sortBy: z.enum(["popularity", "rating", "release_date", "title"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
});

export type MovieFilter = z.infer<typeof movieFilterSchema>;
