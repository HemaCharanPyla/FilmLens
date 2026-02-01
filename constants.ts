
export const OMDB_API_KEY = '98601108'; // Replace 'PLACEHOLDER_OMDB_KEY' with your real key
export const BASE_URL = 'https://www.omdbapi.com/';

export const LANGUAGES = [
  'All', 'English', 'Hindi', 'Telugu', 'Tamil', 'Korean', 'Japanese', 'French', 'Spanish'
];

export const GENRES = [
  'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Documentary', 
  'Drama', 'Family', 'Fantasy', 'Horror', 'Music', 'Musical', 'Mystery', 
  'Romance', 'Sci-Fi', 'Short', 'Sport', 'Thriller', 'War', 'Western'
];

export const INITIAL_SEARCH = 'Trending';
export const CURRENT_YEAR = new Date().getFullYear();

export const DEFAULT_FILTERS = {
  language: 'All',
  genres: [],
  yearStart: 1950,
  yearEnd: CURRENT_YEAR,
  minRating: 0,
  maxRuntime: 300,
};
