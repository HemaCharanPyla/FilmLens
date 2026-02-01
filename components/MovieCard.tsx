
import React from 'react';
import { MovieDetails } from '../types';

interface MovieCardProps {
  movie: MovieDetails;
  isLiked: boolean;
  onLike: (movie: MovieDetails) => void;
  onDislike?: (movie: MovieDetails) => void;
  onSelect: (movie: MovieDetails) => void;
  isAuthenticated: boolean;
  onLoginReq: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, isLiked, onLike, onDislike, onSelect, isAuthenticated, onLoginReq }) => {
  const handleWatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const searchUrl = `https://www.google.com/search?q=where+to+watch+${encodeURIComponent(movie.Title)}+${movie.Year}+streaming`;
    window.open(searchUrl, '_blank');
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onLoginReq();
      return;
    }
    onLike(movie);
  };

  return (
    <div 
      className="netflix-card relative group rounded-md overflow-hidden bg-[#181818] shadow-2xl cursor-pointer aspect-[2/3]"
      onClick={() => onSelect(movie)}
    >
      <img 
        src={movie.Poster !== 'N/A' ? movie.Poster : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400'} 
        alt={movie.Title}
        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-40"
      />
      
      {/* Hover Info Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black via-black/40 to-transparent">
        <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">{movie.Title}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-green-500 font-bold text-[10px]">{Math.floor((parseFloat(movie.imdbRating) || 0) * 10)}% Match</span>
          <span className="text-[10px] text-white font-bold">{movie.imdbRating} ★</span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button 
              onClick={handleLikeClick}
              className={`p-1.5 rounded-full border transition-all ${
                isLiked ? 'bg-white border-white text-black' : 'border-gray-500 text-white hover:border-white'
              }`}
              title={isLiked ? "Remove from My List" : "Add to My List"}
            >
              {isLiked ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            {onDislike && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDislike(movie); }}
                className="p-1.5 rounded-full border border-gray-500 text-white hover:bg-[#e50914]/40 hover:border-[#e50914] transition-all"
                title="Not for me"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" transform="rotate(180 10 10)"/>
                </svg>
              </button>
            )}
          </div>
          
          <button 
            onClick={handleWatch}
            className="bg-white text-black p-1.5 rounded-full hover:bg-gray-200 transition-colors shadow-lg"
            title="Watch Now"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
