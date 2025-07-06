import { GenreResult } from "@shared/schema";
import { ExternalLink } from "lucide-react";

interface GenreResultsProps {
  genreResults: GenreResult[];
}

export default function GenreResults({ genreResults }: GenreResultsProps) {
  if (!genreResults || genreResults.length === 0) {
    return null;
  }

  return (
    <div className="bg-spotify-dark rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-white">Genre Classification Results</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {genreResults.map((genre, index) => (
          <div key={index} className="bg-spotify-gray rounded-lg p-4 hover:bg-opacity-80 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-spotify-green">{genre.genre}</h3>
              <span className="text-sm text-spotify-light-gray">
                {genre.trackCount} song{genre.trackCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="w-full bg-spotify-black rounded-full h-2 mb-3">
              <div 
                className="bg-spotify-green h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(genre.confidence, 100)}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-spotify-light-gray">
                Confidence: {Math.round(genre.confidence)}%
              </span>
              <button className="text-spotify-green hover:text-spotify-light-green transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
