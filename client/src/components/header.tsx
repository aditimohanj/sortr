import { User } from "@shared/schema";
import { Music } from "lucide-react";
import { useLocation } from "wouter";

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    setLocation('/auth');
  };

  return (
    <header className="bg-spotify-dark border-b border-spotify-gray px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Genre Playlist Organizer</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {user.profileImage && (
              <img 
                src={user.profileImage} 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-sm text-white">{user.displayName}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="text-spotify-light-gray hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm7.707 5.293a1 1 0 010 1.414L9.414 11H13a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
