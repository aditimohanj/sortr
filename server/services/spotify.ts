import { SpotifyTrack, SpotifyAudioFeatures, UserStats } from "@shared/schema";

export class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || "";
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || "http://localhost:5000/api/auth/callback";
    console.log('SpotifyService initialized with redirect URI:', this.redirectUri);
  }

  getAuthUrl(): string {
    const scopes = [
      'user-library-read',
      'playlist-modify-public',
      'playlist-modify-private',
      'user-read-private',
      'user-read-email'
    ].join(' ');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      scope: scopes,
      redirect_uri: this.redirectUri,
      show_dialog: 'true'
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    console.log('Exchanging code for tokens with redirect URI:', this.redirectUri);
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Spotify token exchange error:', response.status, response.statusText, errorText);
      throw new Error(`Failed to exchange code for tokens: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh access token: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in
    };
  }

  async getUserProfile(accessToken: string): Promise<{
    id: string;
    display_name: string;
    email: string;
    images: { url: string }[];
  }> {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get user profile: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserStats(accessToken: string): Promise<UserStats> {
    try {
      // Get liked songs count
      const likedSongsResponse = await fetch('https://api.spotify.com/v1/me/tracks?limit=1', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!likedSongsResponse.ok) {
        throw new Error(`Failed to get liked songs: ${likedSongsResponse.statusText}`);
      }
      
      const likedSongsData = await likedSongsResponse.json();
      const likedSongs = likedSongsData.total || 0;

      // Get playlists count
      const playlistsResponse = await fetch('https://api.spotify.com/v1/me/playlists?limit=1', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!playlistsResponse.ok) {
        throw new Error(`Failed to get playlists: ${playlistsResponse.statusText}`);
      }
      
      const playlistsData = await playlistsResponse.json();
      const existingPlaylists = playlistsData.total || 0;

      return {
        likedSongs,
        existingPlaylists,
        genresDetected: 0 // Will be updated after analysis
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        likedSongs: 0,
        existingPlaylists: 0,
        genresDetected: 0
      };
    }
  }

  async getAllLikedSongs(accessToken: string): Promise<SpotifyTrack[]> {
    const tracks: SpotifyTrack[] = [];
    let offset = 0;
    const limit = 50;

    while (true) {
      const response = await fetch(`https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch liked songs: ${response.statusText}`);
      }

      const data = await response.json();
      
      for (const item of data.items) {
        tracks.push({
          id: item.track.id,
          name: item.track.name,
          artists: item.track.artists.map((artist: any) => ({
            id: artist.id,
            name: artist.name
          })),
          uri: item.track.uri
        });
      }

      if (data.next === null) break;
      offset += limit;
    }

    return tracks;
  }

  async getAudioFeatures(accessToken: string, trackIds: string[]): Promise<SpotifyAudioFeatures[]> {
    const features: SpotifyAudioFeatures[] = [];
    const batchSize = 50;

    for (let i = 0; i < trackIds.length; i += batchSize) {
      const batch = trackIds.slice(i, i + batchSize);
      const response = await fetch(`https://api.spotify.com/v1/audio-features?ids=${batch.join(',')}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audio features: ${response.statusText}`);
      }

      const data = await response.json();
      features.push(...data.audio_features.filter((f: any) => f !== null));
    }

    return features;
  }

  async getArtistGenres(accessToken: string, artistIds: string[]): Promise<Map<string, string[]>> {
    const genres = new Map<string, string[]>();
    const batchSize = 50;

    for (let i = 0; i < artistIds.length; i += batchSize) {
      const batch = artistIds.slice(i, i + batchSize);
      const response = await fetch(`https://api.spotify.com/v1/artists?ids=${batch.join(',')}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch artist genres: ${response.statusText}`);
      }

      const data = await response.json();
      for (const artist of data.artists) {
        genres.set(artist.id, artist.genres || []);
      }
    }

    return genres;
  }

  async createPlaylist(accessToken: string, userId: string, name: string, description: string, isPublic: boolean = false): Promise<{
    id: string;
    name: string;
    external_urls: { spotify: string };
  }> {
    const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description,
        public: isPublic,
        collaborative: false
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create playlist: ${response.statusText}`);
    }

    return response.json();
  }

  async addTracksToPlaylist(accessToken: string, playlistId: string, trackUris: string[]): Promise<void> {
    const batchSize = 100;

    for (let i = 0; i < trackUris.length; i += batchSize) {
      const batch = trackUris.slice(i, i + batchSize);
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: batch
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to add tracks to playlist: ${response.statusText}`);
      }
    }
  }

  classifyGenres(tracks: SpotifyTrack[], settings: {
    useAudioFeatures: boolean;
    useArtistGenres: boolean;
    minSongsPerPlaylist: number;
  }): Map<string, SpotifyTrack[]> {
    const genreMap = new Map<string, SpotifyTrack[]>();

    for (const track of tracks) {
      let genres: string[] = [];

      // Use artist genres if enabled
      if (settings.useArtistGenres) {
        for (const artist of track.artists) {
          if (artist.genres) {
            genres.push(...artist.genres);
          }
        }
      }

      // Use audio features for classification if enabled
      if (settings.useAudioFeatures && track.audioFeatures) {
        const features = track.audioFeatures;
        
        // Simple classification based on audio features
        if (features.energy > 0.7 && features.danceability > 0.7) {
          genres.push('Electronic');
        } else if (features.acousticness > 0.6) {
          genres.push('Acoustic');
        } else if (features.instrumentalness > 0.5) {
          genres.push('Instrumental');
        } else if (features.energy > 0.8) {
          genres.push('Rock');
        } else if (features.valence > 0.8) {
          genres.push('Pop');
        } else if (features.speechiness > 0.66) {
          genres.push('Hip-Hop');
        } else {
          genres.push('Alternative');
        }
      }

      // Default to 'Unclassified' if no genres found
      if (genres.length === 0) {
        genres = ['Unclassified'];
      }

      // Add track to each genre
      for (const genre of genres) {
        const normalizedGenre = this.normalizeGenre(genre);
        if (!genreMap.has(normalizedGenre)) {
          genreMap.set(normalizedGenre, []);
        }
        genreMap.get(normalizedGenre)!.push(track);
      }
    }

    // Filter out genres with fewer than minimum songs
    const filteredGenres = new Map<string, SpotifyTrack[]>();
    for (const [genre, tracks] of genreMap.entries()) {
      if (tracks.length >= settings.minSongsPerPlaylist) {
        filteredGenres.set(genre, tracks);
      }
    }

    return filteredGenres;
  }

  private normalizeGenre(genre: string): string {
    const genreMap: Record<string, string> = {
      'pop': 'Pop',
      'rock': 'Rock',
      'hip hop': 'Hip-Hop',
      'rap': 'Hip-Hop',
      'electronic': 'Electronic',
      'edm': 'Electronic',
      'dance': 'Electronic',
      'jazz': 'Jazz',
      'classical': 'Classical',
      'country': 'Country',
      'folk': 'Folk',
      'indie': 'Indie',
      'alternative': 'Alternative',
      'r&b': 'R&B',
      'soul': 'Soul',
      'blues': 'Blues',
      'reggae': 'Reggae',
      'punk': 'Punk',
      'metal': 'Metal',
      'acoustic': 'Acoustic',
      'instrumental': 'Instrumental'
    };

    const lowerGenre = genre.toLowerCase();
    return genreMap[lowerGenre] || genre;
  }
}

export const spotifyService = new SpotifyService();
