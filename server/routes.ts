import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { spotifyService } from "./services/spotify";
import { insertUserSchema, insertProcessingJobSchema, insertSettingsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.get("/api/auth/url", async (req, res) => {
    try {
      const authUrl = spotifyService.getAuthUrl();
      res.json({ url: authUrl });
    } catch (error) {
      console.error("Error getting auth URL:", error);
      res.status(500).json({ message: "Failed to get auth URL" });
    }
  });

  app.get("/api/auth/callback", async (req, res) => {
    try {
      const { code } = req.query;
      if (!code) {
        return res.status(400).json({ message: "Authorization code required" });
      }

      const tokens = await spotifyService.exchangeCodeForTokens(code as string);
      const profile = await spotifyService.getUserProfile(tokens.accessToken);
      
      const expiryDate = new Date(Date.now() + tokens.expiresIn * 1000);
      
      let user = await storage.getUserBySpotifyId(profile.id);
      if (!user) {
        user = await storage.createUser({
          spotifyId: profile.id,
          displayName: profile.display_name,
          email: profile.email,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpiry: expiryDate,
          profileImage: profile.images[0]?.url || null
        });

        // Create default settings
        await storage.createSettings({
          userId: user.id,
          useAudioFeatures: true,
          useArtistGenres: true,
          minSongsPerPlaylist: 10,
          makePlaylistsPublic: false,
          addEmojis: true,
          playlistPrefix: ""
        });
      } else {
        await storage.updateUser(user.id, {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpiry: expiryDate
        });
      }

      // Return HTML that closes the popup and redirects the parent window
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.location.href = '/?userId=${user.id}';
                window.close();
              } else {
                window.location.href = '/?userId=${user.id}';
              }
            </script>
            <p>Authentication successful! Redirecting...</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Error in auth callback:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        profileImage: user.profileImage
      });
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.get("/api/user/:id/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const stats = await spotifyService.getUserStats(user.accessToken);
      res.json(stats);
    } catch (error) {
      console.error("Error getting user stats:", error);
      res.status(500).json({ message: "Failed to get user stats" });
    }
  });

  // Processing routes
  app.post("/api/processing/start", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const settings = await storage.getSettings(userId);
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }

      // Create or update processing job
      let job = await storage.getProcessingJob(userId);
      if (!job) {
        job = await storage.createProcessingJob({
          userId,
          status: 'fetching',
          progress: 0,
          currentStep: 'Fetching liked songs...',
          startedAt: new Date()
        });
      } else {
        job = await storage.updateProcessingJob(userId, {
          status: 'fetching',
          progress: 0,
          currentStep: 'Fetching liked songs...',
          startedAt: new Date(),
          errorMessage: null
        });
      }

      // Start processing in background
      processLikedSongs(user, settings, job!.id);

      res.json({ message: "Processing started", jobId: job!.id });
    } catch (error) {
      console.error("Error starting processing:", error);
      res.status(500).json({ message: "Failed to start processing" });
    }
  });

  app.get("/api/processing/status/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const job = await storage.getProcessingJob(userId);
      
      if (!job) {
        return res.json({ status: 'idle', progress: 0 });
      }

      res.json(job);
    } catch (error) {
      console.error("Error getting processing status:", error);
      res.status(500).json({ message: "Failed to get processing status" });
    }
  });

  // Settings routes
  app.get("/api/settings/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const settings = await storage.getSettings(userId);
      
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }

      res.json(settings);
    } catch (error) {
      console.error("Error getting settings:", error);
      res.status(500).json({ message: "Failed to get settings" });
    }
  });

  app.patch("/api/settings/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const updates = req.body;
      
      const settings = await storage.updateSettings(userId, updates);
      
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }

      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  async function processLikedSongs(user: any, settings: any, jobId: number) {
    try {
      // Update job status
      await storage.updateProcessingJob(user.id, {
        status: 'fetching',
        progress: 10,
        currentStep: 'Fetching liked songs...'
      });

      // Get all liked songs
      const tracks = await spotifyService.getAllLikedSongs(user.accessToken);
      
      await storage.updateProcessingJob(user.id, {
        status: 'analyzing',
        progress: 30,
        currentStep: 'Analyzing audio features...',
        totalSongs: tracks.length
      });

      // Get audio features if enabled
      if (settings.useAudioFeatures) {
        const trackIds = tracks.map(t => t.id);
        const audioFeatures = await spotifyService.getAudioFeatures(user.accessToken, trackIds);
        
        // Attach audio features to tracks
        for (let i = 0; i < tracks.length; i++) {
          tracks[i].audioFeatures = audioFeatures[i];
        }
      }

      // Get artist genres if enabled
      if (settings.useArtistGenres) {
        const artistIds = Array.from(new Set(tracks.flatMap(t => t.artists.map(a => a.id))));
        const artistGenres = await spotifyService.getArtistGenres(user.accessToken, artistIds);
        
        // Attach genres to artists
        for (const track of tracks) {
          for (const artist of track.artists) {
            artist.genres = artistGenres.get(artist.id) || [];
          }
        }
      }

      await storage.updateProcessingJob(user.id, {
        status: 'creating',
        progress: 60,
        currentStep: 'Creating playlists...',
        processedSongs: tracks.length
      });

      // Classify genres
      const genreMap = spotifyService.classifyGenres(tracks, settings);
      
      // Create playlists
      const profile = await spotifyService.getUserProfile(user.accessToken);
      const createdPlaylists = [];
      const genreResults = [];

      let playlistCount = 0;
      const genreEntries = Array.from(genreMap.entries());
      for (const [genre, genreTracks] of genreEntries) {
        const emoji = settings.addEmojis ? getGenreEmoji(genre) : '';
        const prefix = settings.playlistPrefix ? `${settings.playlistPrefix} ` : '';
        const playlistName = `${prefix}${emoji}${genre}`;
        
        const playlist = await spotifyService.createPlaylist(
          user.accessToken,
          profile.id,
          playlistName,
          `Auto-generated playlist containing ${genreTracks.length} songs classified as ${genre}`,
          settings.makePlaylistsPublic
        );

        await spotifyService.addTracksToPlaylist(
          user.accessToken,
          playlist.id,
          genreTracks.map((t: any) => t.uri)
        );

        createdPlaylists.push({
          id: playlist.id,
          name: playlist.name,
          songCount: genreTracks.length,
          createdAt: new Date().toISOString(),
          status: 'complete' as const,
          spotifyUrl: playlist.external_urls.spotify
        });

        genreResults.push({
          genre,
          songs: genreTracks.map((t: any) => t.name),
          confidence: 85 + Math.random() * 15, // Mock confidence
          trackCount: genreTracks.length
        });

        playlistCount++;
        const progress = 60 + (playlistCount / genreEntries.length) * 35;
        await storage.updateProcessingJob(user.id, {
          progress: Math.round(progress),
          currentStep: `Creating playlist ${playlistCount} of ${genreEntries.length}...`
        });
      }

      // Complete processing
      await storage.updateProcessingJob(user.id, {
        status: 'completed',
        progress: 100,
        currentStep: 'Processing complete!',
        genreResults,
        createdPlaylists,
        completedAt: new Date()
      });

    } catch (error) {
      console.error("Error processing liked songs:", error);
      await storage.updateProcessingJob(user.id, {
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  function getGenreEmoji(genre: string): string {
    const emojiMap: Record<string, string> = {
      'Pop': '🎵',
      'Rock': '🎸',
      'Hip-Hop': '🎤',
      'Electronic': '🎧',
      'Jazz': '🎷',
      'Classical': '🎼',
      'Country': '🤠',
      'Folk': '🪕',
      'Indie': '🎨',
      'Alternative': '🎭',
      'R&B': '🎶',
      'Soul': '💫',
      'Blues': '🎺',
      'Reggae': '🌴',
      'Punk': '⚡',
      'Metal': '🤘',
      'Acoustic': '🎻',
      'Instrumental': '🎹'
    };
    return emojiMap[genre] || '🎵';
  }

  const httpServer = createServer(app);
  return httpServer;
}
