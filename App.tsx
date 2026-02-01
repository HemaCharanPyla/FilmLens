
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MovieDetails, Filters } from './types';
import { searchMovies, getFullDetailsForList } from './services/omdbService';
import { INITIAL_SEARCH, DEFAULT_FILTERS } from './constants';
import Loading from './components/Loading';
import Sidebar from './components/Sidebar';
import MovieCard from './components/MovieCard';
import MovieModal from './components/MovieModal';

type SortOption = 'title' | 'year' | 'rating';

/**
 * MOCK AUTH SYSTEM
 * To prevent 'Unknown Host' errors in the browser-only environment,
 * we simulate the Auth0 experience. This provides a professional UI 
 * while ensuring the app is functional without external domain setup.
 */
const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [movies, setMovies] = useState<MovieDetails[]>([]);
  const [likedMovies, setLikedMovies] = useState<MovieDetails[]>([]);
  const [dislikedIds, setDislikedIds] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<MovieDetails[]>([]);
  const [heroMovie, setHeroMovie] = useState<MovieDetails | null>(null);
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDiscoverLoading, setIsDiscoverLoading] = useState(false);
  const [isRecLoading, setIsRecLoading] = useState(false);
  
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetails | null>(null);
  const [recSortBy, setRecSortBy] = useState<SortOption>('rating');

  // Initialize Mock Auth
  useEffect(() => {
    const storedUser = localStorage.getItem('filmLens_mock_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setIsAuthLoading(false);
  }, []);

  // Load user-specific data
  useEffect(() => {
    const storageKeySuffix = user ? `_${user.sub}` : '_guest';
    const storedLikes = localStorage.getItem(`filmLens_likes${storageKeySuffix}`);
    const storedDislikes = localStorage.getItem(`filmLens_dislikes${storageKeySuffix}`);
    const storedLastSearch = localStorage.getItem('filmLens_lastSearch');
    
    const likes: MovieDetails[] = storedLikes ? JSON.parse(storedLikes) : [];
    const dislikes: string[] = storedDislikes ? JSON.parse(storedDislikes) : [];
    
    setLikedMovies(likes);
    setDislikedIds(dislikes);

    // Initial Search Logic: Last Search > Liked Genres > Default
    let initialQuery = INITIAL_SEARCH;
    if (storedLastSearch) {
      initialQuery = storedLastSearch;
    } else if (likes.length > 0) {
      const genreCounts: Record<string, number> = {};
      likes.forEach(m => {
        m.Genre.split(',').forEach(g => {
          const t = g.trim();
          genreCounts[t] = (genreCounts[t] || 0) + 1;
        });
      });
      const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (topGenre) initialQuery = topGenre;
    }

    setSearchQuery(initialQuery);
    setInputValue(initialQuery);
  }, [user]);

  // Sync likes to localStorage whenever they change
  useEffect(() => {
    const storageKeySuffix = user ? `_${user.sub}` : '_guest';
    localStorage.setItem(`filmLens_likes${storageKeySuffix}`, JSON.stringify(likedMovies));
    localStorage.setItem(`filmLens_dislikes${storageKeySuffix}`, JSON.stringify(dislikedIds));
  }, [likedMovies, dislikedIds, user]);

  const handleLogin = () => {
    // Simulate Login
    const mockUser = {
      sub: 'demo_user_123',
      name: 'Netflix Fan',
      picture: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png'
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('filmLens_mock_user', JSON.stringify(mockUser));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('filmLens_mock_user');
  };

  const handleSearch = useCallback(async (query: string) => {
    if (!query) return;
    setIsDiscoverLoading(true);
    const basicResults = await searchMovies(query);
    const detailedResults = await getFullDetailsForList(basicResults);
    const filtered = detailedResults.filter(m => !dislikedIds.includes(m.imdbID));
    setMovies(filtered);
    localStorage.setItem('filmLens_lastSearch', query);
    
    if (filtered.length > 0) {
      const sorted = [...filtered].sort((a,b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating));
      setHeroMovie(sorted[0]);
    }
    setIsDiscoverLoading(false);
    if (isInitialLoading) setIsInitialLoading(false);
  }, [dislikedIds, isInitialLoading]);

  useEffect(() => {
    if (searchQuery) handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  // Recommendation Engine logic
  useEffect(() => {
    const updateRecommendations = async () => {
      if (likedMovies.length < 3) {
        setRecommendations([]);
        return;
      }
      setIsRecLoading(true);
      const genreCounts: Record<string, number> = {};
      likedMovies.forEach(movie => {
        movie.Genre.split(',').forEach(g => {
          const t = g.trim();
          genreCounts[t] = (genreCounts[t] || 0) + 1;
        });
      });
      const sortedGenres = Object.entries(genreCounts).sort((a,b) => b[1] - a[1]);
      const topGenre = sortedGenres.length > 0 ? sortedGenres[0][0] : 'Movie';
      const pool = await searchMovies(topGenre);
      const candidates = await getFullDetailsForList(pool);
      const scored = candidates
        .filter(c => !likedMovies.some(l => l.imdbID === c.imdbID) && !dislikedIds.includes(c.imdbID))
        .map(c => ({ ...c, score: Math.random() * 10 })) // Simplified scoring for UI speed
        .sort((a, b) => b.score - a.score)
        .slice(0, 15);
      setRecommendations(scored);
      setIsRecLoading(false);
    };
    updateRecommendations();
  }, [likedMovies, dislikedIds]);

  const sortedRecommendations = useMemo(() => {
    return [...recommendations].sort((a, b) => {
      if (recSortBy === 'title') return a.Title.localeCompare(b.Title);
      if (recSortBy === 'year') return parseInt(b.Year) - parseInt(a.Year);
      return parseFloat(b.imdbRating) - parseFloat(a.imdbRating);
    });
  }, [recommendations, recSortBy]);

  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      if (filters.language !== 'All' && !movie.Language.includes(filters.language)) return false;
      const rating = parseFloat(movie.imdbRating);
      if (!isNaN(rating) && rating < filters.minRating) return false;
      const year = parseInt(movie.Year);
      if (!isNaN(year) && (year < filters.yearStart || year > filters.yearEnd)) return false;
      if (filters.genres.length > 0) {
        const movieGenres = movie.Genre.split(',').map(g => g.trim());
        if (!filters.genres.some(g => movieGenres.includes(g))) return false;
      }
      return true;
    });
  }, [movies, filters]);

  const toggleLike = (movie: MovieDetails) => {
    if (!isAuthenticated) {
      handleLogin(); // Auto-login to show the feature
      return;
    }
    setLikedMovies(prev => {
      const isAlreadyLiked = prev.some(m => m.imdbID === movie.imdbID);
      return isAlreadyLiked ? prev.filter(m => m.imdbID !== movie.imdbID) : [...prev, movie];
    });
    setDislikedIds(prev => prev.filter(id => id !== movie.imdbID));
  };

  const toggleDislike = (movie: MovieDetails) => {
    setDislikedIds(prev => [...prev, movie.imdbID]);
    setLikedMovies(prev => prev.filter(m => m.imdbID !== movie.imdbID));
    setMovies(prev => prev.filter(m => m.imdbID !== movie.imdbID));
  };

  if (isInitialLoading || isAuthLoading) {
    return (
      <div className="h-screen w-screen bg-[#141414] flex flex-col items-center justify-center">
        <h1 className="text-5xl font-black text-[#e50914] mb-8 tracking-tighter uppercase italic">FilmLens</h1>
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-[#141414]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#141414]/95 backdrop-blur-md px-4 sm:px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <h1 className="text-3xl font-black tracking-tighter text-[#e50914] uppercase italic cursor-pointer" onClick={() => window.location.reload()}>FilmLens</h1>
          <nav className="hidden lg:flex gap-6 text-sm font-bold text-gray-400">
            <button className="text-white">Home</button>
            <button className="hover:text-white transition-colors">TV Shows</button>
            <button className="hover:text-white transition-colors">Movies</button>
            <button className="hover:text-white transition-colors" onClick={() => document.getElementById('my-list-section')?.scrollIntoView({behavior: 'smooth'})}>My List</button>
          </nav>
        </div>

        <div className="flex items-center gap-4 w-full md:max-w-xl">
          <form onSubmit={(e) => { e.preventDefault(); setSearchQuery(inputValue); }} className="relative flex-1 group">
            <input 
              type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
              placeholder="Titles, people, genres"
              className="w-full netflix-input rounded-sm py-2 px-10 text-sm border border-transparent focus:border-white/40 outline-none"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 group relative">
                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-sm cursor-pointer border border-white/20" />
                <button onClick={handleLogout} className="hidden group-hover:block absolute top-10 right-0 bg-black/90 border border-white/10 px-4 py-2 text-xs font-bold whitespace-nowrap z-50 shadow-2xl">
                  Sign out
                </button>
              </div>
            ) : (
              <button onClick={handleLogin} className="bg-[#e50914] text-white px-4 py-1.5 rounded-sm text-sm font-bold hover:bg-[#b20710]">
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      {heroMovie && !isDiscoverLoading && (
        <section className="relative w-full h-[65vh] sm:h-[85vh] overflow-hidden mb-[-100px]">
          <div className="absolute inset-0">
            <img src={heroMovie.Poster !== 'N/A' ? heroMovie.Poster : ''} alt={heroMovie.Title} className="w-full h-full object-cover object-top opacity-60 scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
          </div>
          <div className="relative h-full max-w-[1600px] mx-auto px-4 sm:px-12 flex flex-col justify-center gap-6 pb-20">
            <h1 className="text-4xl sm:text-7xl font-black text-white max-w-2xl uppercase italic drop-shadow-2xl">{heroMovie.Title}</h1>
            <div className="flex items-center gap-4 text-sm font-bold text-white">
              <span className="text-green-500">{Math.floor((parseFloat(heroMovie.imdbRating) || 0) * 10)}% Match</span>
              <span className="text-gray-300">{heroMovie.Year}</span>
              <span className="border border-gray-500 px-1.5 rounded-sm text-[10px]">HD</span>
              <span className="text-white">{heroMovie.imdbRating} ★</span>
            </div>
            <p className="text-gray-200 text-sm sm:text-lg max-w-xl line-clamp-3 font-medium">{heroMovie.Plot}</p>
            <div className="flex items-center gap-4">
              <button onClick={() => window.open(`https://www.google.com/search?q=watch+${heroMovie.Title}+streaming`, '_blank')} className="flex items-center gap-3 px-8 sm:px-12 py-3 rounded-md bg-white text-black font-black text-sm sm:text-xl hover:bg-gray-200 transition-all">
                Play
              </button>
              <button onClick={() => toggleLike(heroMovie)} className={`flex items-center gap-3 px-8 py-3 rounded-md border font-black text-sm sm:text-xl transition-all ${likedMovies.some(m => m.imdbID === heroMovie.imdbID) ? 'bg-white/20 border-white' : 'bg-gray-500/40 border-transparent text-white'}`}>
                {likedMovies.some(m => m.imdbID === heroMovie.imdbID) ? '✓ My List' : '+ My List'}
              </button>
            </div>
          </div>
        </section>
      )}

      <main className="max-w-[1600px] mx-auto px-4 sm:px-12 py-10 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12">
          <Sidebar filters={filters} setFilters={setFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />
          <div className="flex-1 space-y-16">
            {/* Recommendations */}
            {likedMovies.length >= 3 && (
              <section className="space-y-6">
                <h2 className="text-2xl font-black text-white">Top Picks For You</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {isRecLoading ? <Loading /> : sortedRecommendations.map(movie => (
                    <MovieCard key={movie.imdbID} movie={movie} isLiked={likedMovies.some(m => m.imdbID === movie.imdbID)} onLike={toggleLike} onDislike={toggleDislike} onSelect={setSelectedMovie} isAuthenticated={isAuthenticated} onLoginReq={handleLogin} />
                  ))}
                </div>
              </section>
            )}

            {/* Discover */}
            <section className="space-y-6">
              <h2 className="text-2xl font-black text-white">Discover</h2>
              {isDiscoverLoading ? <Loading /> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
                  {filteredMovies.map(movie => (
                    <MovieCard key={movie.imdbID} movie={movie} isLiked={likedMovies.some(m => m.imdbID === movie.imdbID)} onLike={toggleLike} onDislike={toggleDislike} onSelect={setSelectedMovie} isAuthenticated={isAuthenticated} onLoginReq={handleLogin} />
                  ))}
                </div>
              )}
            </section>

            {/* My List Section */}
            <section id="my-list-section" className="space-y-6">
              <h2 className="text-2xl font-black text-white">My List ({likedMovies.length})</h2>
              {likedMovies.length > 0 ? (
                <div className="flex overflow-x-auto gap-4 pb-12 scrollbar-hide snap-x">
                  {likedMovies.map(movie => (
                    <div key={movie.imdbID} className="min-w-[200px] max-w-[200px] snap-start">
                      <MovieCard movie={movie} isLiked={true} onLike={toggleLike} onDislike={toggleDislike} onSelect={setSelectedMovie} isAuthenticated={isAuthenticated} onLoginReq={handleLogin} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 bg-[#181818] rounded-md text-center">
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Your list is empty. Add some movies!</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {selectedMovie && (
        <MovieModal movie={selectedMovie} isOpen={!!selectedMovie} onClose={() => setSelectedMovie(null)} isLiked={likedMovies.some(m => m.imdbID === selectedMovie.imdbID)} onLike={toggleLike} />
      )}
    </div>
  );
};

export default App;
