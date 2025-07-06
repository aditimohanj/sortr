import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import ConnectionStatus from "@/components/connection-status";
import ProcessingSection from "@/components/processing-section";
import GenreResults from "@/components/genre-results";
import CreatedPlaylists from "@/components/created-playlists";
import Settings from "@/components/settings";
import { User, UserStats, ProcessingJob } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userIdParam = urlParams.get('userId');
    
    if (userIdParam) {
      setUserId(parseInt(userIdParam));
    } else {
      setLocation('/auth');
    }
  }, [setLocation]);

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: [`/api/user/${userId}`],
    enabled: !!userId,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: [`/api/user/${userId}/stats`],
    enabled: !!userId,
  });

  const { data: processingJob, isLoading: processingLoading } = useQuery<ProcessingJob>({
    queryKey: [`/api/processing/status/${userId}`],
    enabled: !!userId,
    refetchInterval: 2000, // Poll every 2 seconds
  });

  if (!userId) {
    return null;
  }

  if (userLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-spotify-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
          <p className="text-spotify-light-gray">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-spotify-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-spotify-error">Failed to load user profile</p>
          <button 
            onClick={() => setLocation('/auth')}
            className="mt-4 px-4 py-2 bg-spotify-green text-white rounded-lg hover:bg-spotify-light-green transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spotify-black text-white">
      <Header user={user} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <ConnectionStatus stats={stats} />
        <ProcessingSection userId={userId} processingJob={processingJob} />
        {processingJob?.genreResults && (
          <GenreResults genreResults={processingJob.genreResults} />
        )}
        {processingJob?.createdPlaylists && (
          <CreatedPlaylists playlists={processingJob.createdPlaylists} />
        )}
        <Settings userId={userId} />
      </main>
    </div>
  );
}
