import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ProcessingJob } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Heart, AudioWaveform, List, Play, Pause } from "lucide-react";

interface ProcessingSectionProps {
  userId: number;
  processingJob?: ProcessingJob;
}

export default function ProcessingSection({ userId, processingJob }: ProcessingSectionProps) {
  const [isStarting, setIsStarting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const startProcessingMutation = useMutation({
    mutationFn: async () => {
      setIsStarting(true);
      const response = await apiRequest("POST", "/api/processing/start", { userId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Processing Started",
        description: "Your liked songs are being analyzed and organized into playlists.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/processing/status/${userId}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsStarting(false);
    },
  });

  const isProcessing = processingJob?.status && !['idle', 'completed', 'error'].includes(processingJob.status);
  const canStart = !isProcessing && !isStarting;

  return (
    <div className="bg-spotify-dark rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-white">Genre Classification & Playlist Creation</h2>
      
      <div className="space-y-6">
        {/* Step 1: Fetch Liked Songs */}
        <div className="flex items-center justify-between p-4 bg-spotify-gray rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              processingJob?.status === 'fetching' ? 'bg-spotify-warning' : 
              processingJob?.status && ['analyzing', 'creating', 'completed'].includes(processingJob.status) ? 'bg-spotify-green' : 'bg-spotify-gray'
            }`}>
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Fetch Liked Songs</h3>
              <p className="text-sm text-spotify-light-gray">Retrieving your saved tracks from Spotify</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {processingJob?.status === 'fetching' && (
              <div className="text-sm text-spotify-light-gray">
                {processingJob.processedSongs || 0} / {processingJob.totalSongs || 0}
              </div>
            )}
            {processingJob?.status && ['analyzing', 'creating', 'completed'].includes(processingJob.status) && (
              <div className="text-sm text-spotify-light-gray">
                {processingJob.totalSongs || 0} songs
              </div>
            )}
            {processingJob?.status === 'fetching' && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-spotify-warning"></div>
            )}
            {processingJob?.status && ['analyzing', 'creating', 'completed'].includes(processingJob.status) && (
              <div className="text-spotify-green">✓</div>
            )}
          </div>
        </div>

        {/* Step 2: Analyze Audio Features */}
        <div className="flex items-center justify-between p-4 bg-spotify-gray rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              processingJob?.status === 'analyzing' ? 'bg-spotify-warning' : 
              processingJob?.status && ['creating', 'completed'].includes(processingJob.status) ? 'bg-spotify-green' : 'bg-spotify-gray'
            }`}>
              <AudioWaveform className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Analyze Audio Features</h3>
              <p className="text-sm text-spotify-light-gray">Processing audio characteristics and artist genres</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {processingJob?.status === 'analyzing' && (
              <>
                <div className="w-32 bg-spotify-black rounded-full h-2">
                  <div 
                    className="bg-spotify-green h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${processingJob.progress || 0}%` }}
                  ></div>
                </div>
                <div className="text-sm text-spotify-light-gray">{processingJob.progress || 0}%</div>
              </>
            )}
            {processingJob?.status && ['creating', 'completed'].includes(processingJob.status) && (
              <div className="text-spotify-green">✓</div>
            )}
          </div>
        </div>

        {/* Step 3: Create Playlists */}
        <div className="flex items-center justify-between p-4 bg-spotify-gray rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              processingJob?.status === 'creating' ? 'bg-spotify-warning' : 
              processingJob?.status === 'completed' ? 'bg-spotify-green' : 'bg-spotify-gray'
            }`}>
              <List className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Create Genre Playlists</h3>
              <p className="text-sm text-spotify-light-gray">Generating playlists and adding songs</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {processingJob?.status === 'creating' && (
              <>
                <div className="w-32 bg-spotify-black rounded-full h-2">
                  <div 
                    className="bg-spotify-green h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${processingJob.progress || 0}%` }}
                  ></div>
                </div>
                <div className="text-sm text-spotify-light-gray">{processingJob.progress || 0}%</div>
              </>
            )}
            {processingJob?.status === 'completed' && (
              <div className="text-spotify-green">✓</div>
            )}
            {!processingJob?.status && (
              <div className="text-sm text-spotify-light-gray">Waiting...</div>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-4 pt-4">
          <Button 
            onClick={() => startProcessingMutation.mutate()}
            disabled={!canStart}
            className="bg-spotify-green hover:bg-spotify-light-green text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {isStarting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Starting...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Processing
              </>
            )}
          </Button>
          
          {isProcessing && (
            <Button 
              variant="outline"
              className="bg-spotify-gray hover:bg-opacity-80 text-white px-6 py-3 rounded-lg font-semibold transition-colors border-spotify-gray"
              disabled
            >
              <Pause className="w-4 h-4 mr-2" />
              Processing...
            </Button>
          )}
        </div>

        {/* Current Step Display */}
        {processingJob?.currentStep && (
          <div className="text-center pt-2">
            <p className="text-sm text-spotify-light-gray">{processingJob.currentStep}</p>
          </div>
        )}

        {/* Error Display */}
        {processingJob?.status === 'error' && (
          <div className="bg-spotify-error bg-opacity-20 border border-spotify-error rounded-lg p-4">
            <p className="text-spotify-error font-semibold">Processing Error</p>
            <p className="text-sm text-spotify-light-gray mt-1">
              {processingJob.errorMessage || 'An unknown error occurred'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
