import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsType } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface SettingsProps {
  userId: number;
}

export default function Settings({ userId }: SettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState<Partial<SettingsType>>({});

  const { data: settings, isLoading } = useQuery<SettingsType>({
    queryKey: [`/api/settings/${userId}`],
    enabled: !!userId,
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<SettingsType>) => {
      const response = await apiRequest("PATCH", `/api/settings/${userId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/settings/${userId}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(localSettings);
  };

  const handleReset = () => {
    const defaultSettings = {
      useAudioFeatures: true,
      useArtistGenres: true,
      minSongsPerPlaylist: 10,
      makePlaylistsPublic: false,
      addEmojis: true,
      playlistPrefix: ""
    };
    setLocalSettings(defaultSettings);
    updateSettingsMutation.mutate(defaultSettings);
  };

  const updateSetting = (key: keyof SettingsType, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="bg-spotify-dark rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-spotify-gray rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-spotify-gray rounded"></div>
            <div className="h-4 bg-spotify-gray rounded"></div>
            <div className="h-4 bg-spotify-gray rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-spotify-dark rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-white">Settings & Configuration</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-4 text-white">Classification Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-white">Use Audio Features</Label>
              <Switch 
                checked={localSettings.useAudioFeatures ?? true}
                onCheckedChange={(checked) => updateSetting('useAudioFeatures', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-white">Use Artist Genres</Label>
              <Switch 
                checked={localSettings.useArtistGenres ?? true}
                onCheckedChange={(checked) => updateSetting('useArtistGenres', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-white">Minimum Songs per Playlist</Label>
              <Input 
                type="number" 
                value={localSettings.minSongsPerPlaylist ?? 10}
                onChange={(e) => updateSetting('minSongsPerPlaylist', parseInt(e.target.value))}
                min="1" 
                max="100" 
                className="w-20 px-2 py-1 bg-spotify-gray border border-spotify-gray rounded text-sm text-center text-white"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4 text-white">Playlist Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-white">Make Playlists Public</Label>
              <Switch 
                checked={localSettings.makePlaylistsPublic ?? false}
                onCheckedChange={(checked) => updateSetting('makePlaylistsPublic', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-white">Add Emoji to Names</Label>
              <Switch 
                checked={localSettings.addEmojis ?? true}
                onCheckedChange={(checked) => updateSetting('addEmojis', checked)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium block mb-2 text-white">Playlist Name Prefix</Label>
              <Input 
                type="text" 
                placeholder="e.g., 'Auto-Generated:'" 
                value={localSettings.playlistPrefix ?? ''}
                onChange={(e) => updateSetting('playlistPrefix', e.target.value)}
                className="w-full px-3 py-2 bg-spotify-gray border border-spotify-gray rounded text-sm text-white placeholder-spotify-light-gray"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-spotify-gray">
        <Button 
          onClick={handleReset}
          variant="ghost"
          className="text-spotify-light-gray hover:text-white hover:bg-spotify-gray transition-colors px-4 py-2"
        >
          Reset to Default
        </Button>
        <Button 
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
          className="bg-spotify-green hover:bg-spotify-light-green text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
