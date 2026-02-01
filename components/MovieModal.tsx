
import React from 'react';
import { MovieDetails } from '../types';

interface MovieModalProps {
  movie: MovieDetails;
  isOpen: boolean;
  onClose: () => void;
  isLiked: boolean;
  onLike: (movie: MovieDetails) => void;
}

const MovieModal: React.FC<MovieModalProps> = ({ movie, isOpen, onClose, isLiked, onLike }) => {
  if (!isOpen) return null;

  const handleWatch = () => {
    const searchUrl = `https://www.google.com/search?q=where+to+watch+${encodeURIComponent(movie.Title)}+${movie.Year}+streaming`;
    window.open(searchUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 fade-in">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-[#181818] rounded-lg overflow-hidden shadow-2xl border border-white/5 max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-white/20 rounded-full transition-all text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 shrink-0">
            <img 
              src={movie.Poster !== 'N/A' ? movie.Poster : 'https://images.unsplash.com/photo-1485846234645-a62644f84728'} 
              alt={movie.Title}
              className="w-full h-full object-cover min-h-[300px]"
            />
          </div>

          <div className="md:w-2/3 p-8 sm:p-10 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-green-500 font-bold text-sm">New</span>
                <span className="text-gray-400 font-medium text-sm">{movie.Year}</span>
                <span className="border border-gray-600 px-1.5 text-[10px] text-gray-400 rounded">HD</span>
              </div>
              <h2 className="text-4xl font-black text-white">{movie.Title}</h2>
              <div className="flex flex-wrap gap-2 pt-1">
                {movie.Genre.split(',').map(g => (
                  <span key={g} className="text-xs text-gray-300 font-medium">{g.trim()}</span>
                ))}
              </div>
            </div>

            <p className="text-white text-base leading-relaxed">{movie.Plot}</p>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <span className="text-gray-500 block text-xs font-bold uppercase mb-1">Cast</span>
                <p className="text-gray-200">{movie.Actors}</p>
              </div>
              <div>
                <span className="text-gray-500 block text-xs font-bold uppercase mb-1">Director</span>
                <p className="text-gray-200">{movie.Director}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={handleWatch}
                className="flex items-center justify-center gap-3 px-10 py-3 rounded bg-white text-black font-bold text-sm hover:bg-[#e1e1e1] transition-all shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Watch Now
              </button>
              <button 
                onClick={() => onLike(movie)}
                className={`flex items-center justify-center gap-3 px-8 py-3 rounded font-bold text-sm transition-all border ${
                  isLiked 
                    ? 'bg-gray-700/50 border-gray-600 text-white' 
                    : 'bg-black/40 border-gray-600 text-white hover:bg-white/10'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                {isLiked ? 'In My List' : 'Add to My List'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;
