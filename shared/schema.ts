import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  spotifyId: text("spotify_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  email: text("email"),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  tokenExpiry: timestamp("token_expiry").notNull(),
  profileImage: text("profile_image"),
});

export const processingJobs = pgTable("processing_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull(), // 'idle', 'fetching', 'analyzing', 'creating', 'completed', 'error'
  progress: integer("progress").default(0),
  currentStep: text("current_step"),
  totalSongs: integer("total_songs").default(0),
  processedSongs: integer("processed_songs").default(0),
  genreResults: json("genre_results").$type<GenreResult[]>(),
  createdPlaylists: json("created_playlists").$type<CreatedPlaylist[]>(),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  useAudioFeatures: boolean("use_audio_features").default(true),
  useArtistGenres: boolean("use_artist_genres").default(true),
  minSongsPerPlaylist: integer("min_songs_per_playlist").default(10),
  makePlaylistsPublic: boolean("make_playlists_public").default(false),
  addEmojis: boolean("add_emojis").default(true),
  playlistPrefix: text("playlist_prefix").default(""),
});

export const insertUserSchema = createInsertSchema(users).pick({
  spotifyId: true,
  displayName: true,
  email: true,
  accessToken: true,
  refreshToken: true,
  tokenExpiry: true,
  profileImage: true,
});

export const insertProcessingJobSchema = createInsertSchema(processingJobs).pick({
  userId: true,
  status: true,
  progress: true,
  currentStep: true,
  totalSongs: true,
  processedSongs: true,
  genreResults: true,
  createdPlaylists: true,
  errorMessage: true,
  startedAt: true,
  completedAt: true,
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  useAudioFeatures: true,
  useArtistGenres: true,
  minSongsPerPlaylist: true,
  makePlaylistsPublic: true,
  addEmojis: true,
  playlistPrefix: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ProcessingJob = typeof processingJobs.$inferSelect;
export type InsertProcessingJob = z.infer<typeof insertProcessingJobSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

export interface GenreResult {
  genre: string;
  songs: string[];
  confidence: number;
  trackCount: number;
}

export interface CreatedPlaylist {
  id: string;
  name: string;
  songCount: number;
  createdAt: string;
  status: 'creating' | 'complete' | 'error';
  spotifyUrl?: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string; genres?: string[] }[];
  uri: string;
  audioFeatures?: SpotifyAudioFeatures;
}

export interface SpotifyAudioFeatures {
  acousticness: number;
  danceability: number;
  energy: number;
  instrumentalness: number;
  liveness: number;
  loudness: number;
  speechiness: number;
  valence: number;
  tempo: number;
}

export interface UserStats {
  likedSongs: number;
  existingPlaylists: number;
  genresDetected: number;
}
