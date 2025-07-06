import { UserStats } from "@shared/schema";

interface ConnectionStatusProps {
  stats?: UserStats;
}

export default function ConnectionStatus({ stats }: ConnectionStatusProps) {
  return (
    <div className="bg-spotify-dark rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Connection Status</h2>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-spotify-green rounded-full animate-pulse"></div>
          <span className="text-sm text-spotify-light-gray">Connected to Spotify</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-spotify-green">
            {stats?.likedSongs.toLocaleString() || '0'}
          </div>
          <div className="text-sm text-spotify-light-gray">Liked Songs</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-spotify-green">
            {stats?.existingPlaylists.toLocaleString() || '0'}
          </div>
          <div className="text-sm text-spotify-light-gray">Existing Playlists</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-spotify-green">
            {stats?.genresDetected.toLocaleString() || '0'}
          </div>
          <div className="text-sm text-spotify-light-gray">Genres Detected</div>
        </div>
      </div>
    </div>
  );
}
