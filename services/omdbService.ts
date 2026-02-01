
import { OMDB_API_KEY, BASE_URL } from '../constants';
import { MovieBasic, MovieDetails } from '../types';

export const searchMovies = async (query: string, page: number = 1): Promise<MovieBasic[]> => {
  try {
    const response = await fetch(`${BASE_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&type=movie&page=${page}`);
    const data = await response.json();
    if (data.Response === 'True') {
      return data.Search;
    }
    return [];
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
};

export const getMovieDetails = async (id: string): Promise<MovieDetails | null> => {
  try {
    const response = await fetch(`${BASE_URL}?apikey=${OMDB_API_KEY}&i=${id}&plot=full`);
    const data = await response.json();
    if (data.Response === 'True') {
      return data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};

// Helper to batch fetch details for a list of basic movie items
export const getFullDetailsForList = async (movies: MovieBasic[]): Promise<MovieDetails[]> => {
  const promises = movies.map(m => getMovieDetails(m.imdbID));
  const results = await Promise.all(promises);
  return results.filter((m): m is MovieDetails => m !== null);
};
