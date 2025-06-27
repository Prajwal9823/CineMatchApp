export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime?: number;
  vote_average: number;
  vote_count: number;
  genres: Array<{ id: number; name: string }>;
  original_language: string;
  adult: boolean;
  popularity: number;
  video?: boolean;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

class TMDBService {
  private apiKey: string;
  private baseUrl: string = 'https://api.themoviedb.org/3';
  private imageBaseUrl: string = 'https://image.tmdb.org/t/p';

  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('TMDB API key is required');
    }
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('api_key', this.apiKey);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  async getPopularMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
    return this.makeRequest<TMDBResponse<TMDBMovie>>('/movie/popular', {
      page: page.toString()
    });
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBResponse<TMDBMovie>> {
    return this.makeRequest<TMDBResponse<TMDBMovie>>(`/trending/movie/${timeWindow}`);
  }

  async getTopRatedMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
    return this.makeRequest<TMDBResponse<TMDBMovie>>('/movie/top_rated', {
      page: page.toString()
    });
  }

  async getNowPlayingMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
    return this.makeRequest<TMDBResponse<TMDBMovie>>('/movie/now_playing', {
      page: page.toString()
    });
  }

  async getUpcomingMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
    return this.makeRequest<TMDBResponse<TMDBMovie>>('/movie/upcoming', {
      page: page.toString()
    });
  }

  async searchMovies(query: string, page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
    return this.makeRequest<TMDBResponse<TMDBMovie>>('/search/movie', {
      query,
      page: page.toString()
    });
  }

  async getMovieDetails(movieId: number): Promise<TMDBMovie> {
    return this.makeRequest<TMDBMovie>(`/movie/${movieId}`);
  }

  async getMovieVideos(movieId: number): Promise<{ results: TMDBVideo[] }> {
    return this.makeRequest<{ results: TMDBVideo[] }>(`/movie/${movieId}/videos`);
  }

  async getGenres(): Promise<{ genres: TMDBGenre[] }> {
    return this.makeRequest<{ genres: TMDBGenre[] }>('/genre/movie/list');
  }

  async discoverMovies(params: {
    page?: number;
    sort_by?: string;
    'vote_average.gte'?: number;
    'vote_average.lte'?: number;
    with_genres?: string;
    'primary_release_date.gte'?: string;
    'primary_release_date.lte'?: string;
    'with_runtime.gte'?: number;
    'with_runtime.lte'?: number;
    with_original_language?: string;
    certification_country?: string;
    certification?: string;
  } = {}): Promise<TMDBResponse<TMDBMovie>> {
    const queryParams: Record<string, string> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams[key] = value.toString();
      }
    });

    return this.makeRequest<TMDBResponse<TMDBMovie>>('/discover/movie', queryParams);
  }

  getImageUrl(path: string | null, size: 'w200' | 'w300' | 'w400' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
    if (!path) return null;
    return `${this.imageBaseUrl}/${size}${path}`;
  }

  getPosterUrl(path: string | null, size: 'w200' | 'w300' | 'w400' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
    return this.getImageUrl(path, size);
  }

  getBackdropUrl(path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string | null {
    return this.getImageUrl(path, size);
  }

  async getYouTubeTrailer(movieId: number): Promise<string | null> {
    try {
      const videos = await this.getMovieVideos(movieId);
      const trailer = videos.results.find(
        video => video.site === 'YouTube' && 
                 video.type === 'Trailer' && 
                 video.official
      ) || videos.results.find(
        video => video.site === 'YouTube' && video.type === 'Trailer'
      );
      
      return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
    } catch (error) {
      console.error('Error fetching YouTube trailer:', error);
      return null;
    }
  }

  async getYouTubeEmbedUrl(movieId: number): Promise<string | null> {
    try {
      const videos = await this.getMovieVideos(movieId);
      const trailer = videos.results.find(
        video => video.site === 'YouTube' && 
                 video.type === 'Trailer' && 
                 video.official
      ) || videos.results.find(
        video => video.site === 'YouTube' && video.type === 'Trailer'
      );
      
      return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
    } catch (error) {
      console.error('Error fetching YouTube embed URL:', error);
      return null;
    }
  }
}

export const tmdbService = new TMDBService();
