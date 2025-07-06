import { CreatedPlaylist } from "@shared/schema";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Music, RefreshCw, ExternalLink, Edit } from "lucide-react";

interface CreatedPlaylistsProps {
  playlists: CreatedPlaylist[];
}

export default function CreatedPlaylists({ playlists }: CreatedPlaylistsProps) {
  const queryClient = useQueryClient();

  if (!playlists || playlists.length === 0) {
    return null;
  }

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/processing/status'] });
  };

  const handleOpenInSpotify = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const createdAt = new Date(dateString);
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hr ago`;
    return `${Math.floor(diffMinutes / 1440)} day${Math.floor(diffMinutes / 1440) !== 1 ? 's' : ''} ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-spotify-green';
      case 'creating': return 'bg-spotify-warning';
      case 'error': return 'bg-spotify-error';
      default: return 'bg-spotify-gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete': return 'Complete';
      case 'creating': return 'In Progress';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-spotify-dark rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Created Playlists</h2>
        <Button 
          onClick={handleRefresh}
          variant="ghost"
          className="text-spotify-green hover:text-spotify-light-green hover:bg-spotify-gray transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-spotify-gray">
              <th className="pb-3 font-semibold text-spotify-light-gray">Playlist Name</th>
              <th className="pb-3 font-semibold text-spotify-light-gray">Songs</th>
              <th className="pb-3 font-semibold text-spotify-light-gray">Created</th>
              <th className="pb-3 font-semibold text-spotify-light-gray">Status</th>
              <th className="pb-3 font-semibold text-spotify-light-gray">Actions</th>
            </tr>
          </thead>
          <tbody>
            {playlists.map((playlist, index) => (
              <tr key={index} className="border-b border-spotify-gray border-opacity-30">
                <td className="py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-spotify-green rounded-md flex items-center justify-center">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-white">{playlist.name}</span>
                  </div>
                </td>
                <td className="py-4 text-spotify-light-gray">{playlist.songCount}</td>
                <td className="py-4 text-spotify-light-gray">{formatTimeAgo(playlist.createdAt)}</td>
                <td className="py-4">
                  <span className={`${getStatusColor(playlist.status)} text-white px-2 py-1 rounded-full text-xs`}>
                    {getStatusText(playlist.status)}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleOpenInSpotify(playlist.spotifyUrl)}
                      disabled={playlist.status !== 'complete'}
                      className={`${
                        playlist.status === 'complete' 
                          ? 'text-spotify-green hover:text-spotify-light-green' 
                          : 'text-spotify-light-gray opacity-50 cursor-not-allowed'
                      } transition-colors`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button className="text-spotify-light-gray hover:text-white transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
