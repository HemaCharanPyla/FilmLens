
import React from 'react';
import { Filters } from '../types';
import { LANGUAGES, GENRES, CURRENT_YEAR } from '../constants';

interface SidebarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onReset: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ filters, setFilters, onReset }) => {
  const toggleGenre = (genre: string) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  return (
    <aside className="w-full lg:w-72 space-y-8 bg-[#181818] p-6 rounded-lg border border-white/5 h-fit lg:sticky lg:top-24">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-white uppercase tracking-widest">Controls</h2>
        <button 
          onClick={onReset}
          className="text-[10px] text-gray-500 hover:text-[#e50914] transition-colors uppercase font-black"
        >
          Reset
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Language</label>
          <select 
            value={filters.language}
            onChange={(e) => setFilters({...filters, language: e.target.value})}
            className="w-full netflix-input rounded px-3 py-2 text-sm outline-none"
          >
            {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] font-black text-gray-500 uppercase">Min Rating</label>
            <span className="text-[#e50914] font-bold text-xs">{filters.minRating}</span>
          </div>
          <input 
            type="range" min="0" max="10" step="0.5"
            value={filters.minRating}
            onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
            className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#e50914]"
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Genres</label>
          <div className="flex flex-wrap gap-2">
            {GENRES.slice(0, 12).map(genre => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-2 py-1 rounded text-[9px] font-bold transition-all border ${
                  filters.genres.includes(genre)
                    ? 'bg-[#e50914] border-[#e50914] text-white'
                    : 'bg-transparent border-white/10 text-gray-400 hover:border-white/40'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
