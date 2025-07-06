import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";

export default function Auth() {
  const [, setLocation] = useLocation();

  const { data: authData, isLoading } = useQuery<{ url: string }>({
    queryKey: ['/api/auth/url'],
    staleTime: 0,
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    
    if (userId) {
      setLocation(`/?userId=${userId}`);
    }
  }, [setLocation]);

  const handleLogin = () => {
    if (authData?.url) {
      window.location.href = authData.url;
    }
  };

  return (
    <div className="min-h-screen bg-spotify-black text-white flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 bg-spotify-dark border-spotify-gray">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center">
              <Music className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Spotify Genre Organizer
          </CardTitle>
          <p className="text-spotify-light-gray mt-2">
            Automatically organize your liked songs into genre-specific playlists
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="font-semibold mb-2">What this app does:</h3>
            <ul className="text-sm text-spotify-light-gray space-y-1">
              <li>• Analyzes your liked songs</li>
              <li>• Classifies them by genre</li>
              <li>• Creates organized playlists</li>
              <li>• Keeps your liked songs intact</li>
            </ul>
          </div>
          
          <Button 
            onClick={handleLogin}
            disabled={isLoading || !authData?.url}
            className="w-full bg-spotify-green hover:bg-spotify-light-green text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </div>
            ) : (
              <>
                <Music className="w-4 h-4 mr-2" />
                Connect to Spotify
              </>
            )}
          </Button>
          
          <p className="text-xs text-spotify-light-gray text-center">
            By connecting, you agree to allow this app to access your Spotify library and create playlists on your behalf.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
