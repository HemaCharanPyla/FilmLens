
export interface MovieBasic {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface MovieDetails extends MovieBasic {
  Genre: string;
  Language: string;
  Runtime: string;
  imdbRating: string;
  Plot: string;
  Director: string;
  Actors: string;
  Released: string;
}

export interface Filters {
  language: string;
  genres: string[];
  yearStart: number;
  yearEnd: number;
  minRating: number;
  maxRuntime: number;
}

export interface RecommendationProfile {
  topGenres: string[];
  dominantLanguage: string;
  avgRating: number;
  topDirectors: string[];
  topActors: string[];
  commonPlotKeywords: string[];
}
