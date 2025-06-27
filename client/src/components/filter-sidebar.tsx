import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Filter, Calendar, Star, Clock, Shield, Globe, Theater } from "lucide-react";
import type { MovieFilter } from "@shared/schema";

interface FilterSidebarProps {
  filters: MovieFilter;
  onFilterChange: (filters: Partial<MovieFilter>) => void;
  onClose?: () => void;
}

const regions = [
  { id: "en", name: "Hollywood", flag: "🇺🇸" },
  { id: "hi", name: "Bollywood", flag: "🇮🇳" },
  { id: "ko", name: "Korean", flag: "🇰🇷" },
  { id: "ja", name: "Anime", flag: "🇯🇵" },
  { id: "fr", name: "French", flag: "🇫🇷" },
  { id: "es", name: "Spanish", flag: "🇪🇸" },
  { id: "de", name: "German", flag: "🇩🇪" },
  { id: "it", name: "Italian", flag: "🇮🇹" },
];

const ageRatings = ["G", "PG", "PG-13", "R", "NC-17"];

export default function FilterSidebar({ filters, onFilterChange, onClose }: FilterSidebarProps) {
  const [selectedGenres, setSelectedGenres] = useState<number[]>(filters.genres || []);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(filters.regions || []);
  const [selectedAgeRatings, setSelectedAgeRatings] = useState<string[]>(filters.ageRating || []);
  const [releaseYear, setReleaseYear] = useState([filters.releaseYearFrom || 1950]);
  const [rating, setRating] = useState([filters.ratingMin || 0]);
  const [runtime, setRuntime] = useState(filters.runtime || "any");

  // Fetch genres from TMDB
  const { data: genresData } = useQuery({
    queryKey: ["/api/genres"],
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange({
        genres: selectedGenres.length > 0 ? selectedGenres : undefined,
        regions: selectedRegions.length > 0 ? selectedRegions : undefined,
        ageRating: selectedAgeRatings.length > 0 ? selectedAgeRatings : undefined,
        releaseYearFrom: releaseYear[0] !== 1950 ? releaseYear[0] : undefined,
        ratingMin: rating[0] !== 0 ? rating[0] : undefined,
        runtime: runtime !== "any" ? runtime : undefined,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedGenres, selectedRegions, selectedAgeRatings, releaseYear, rating, runtime, onFilterChange]);

  const handleGenreChange = (genreId: number, checked: boolean) => {
    if (checked) {
      setSelectedGenres(prev => [...prev, genreId]);
    } else {
      setSelectedGenres(prev => prev.filter(id => id !== genreId));
    }
  };

  const handleRegionChange = (regionId: string, checked: boolean) => {
    if (checked) {
      setSelectedRegions(prev => [...prev, regionId]);
    } else {
      setSelectedRegions(prev => prev.filter(id => id !== regionId));
    }
  };

  const handleAgeRatingChange = (ageRating: string, checked: boolean) => {
    if (checked) {
      setSelectedAgeRatings(prev => [...prev, ageRating]);
    } else {
      setSelectedAgeRatings(prev => prev.filter(rating => rating !== ageRating));
    }
  };

  const clearAllFilters = () => {
    setSelectedGenres([]);
    setSelectedRegions([]);
    setSelectedAgeRatings([]);
    setReleaseYear([1950]);
    setRating([0]);
    setRuntime("any");
    onFilterChange({
      genres: undefined,
      regions: undefined,
      ageRating: undefined,
      releaseYearFrom: undefined,
      ratingMin: undefined,
      runtime: undefined,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedGenres.length > 0) count++;
    if (selectedRegions.length > 0) count++;
    if (selectedAgeRatings.length > 0) count++;
    if (releaseYear[0] !== 1950) count++;
    if (rating[0] !== 0) count++;
    if (runtime !== "any") count++;
    return count;
  };

  return (
    <div className="w-80 bg-cinema-gray border-r border-gray-700 min-h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-cinema-gold" />
            <h2 className="text-xl font-display font-semibold text-cinema-gold">Filters</h2>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="bg-cinema-gold text-cinema-dark">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Genre Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Theater className="h-4 w-4 text-cinema-gold" />
            <h3 className="font-semibold text-white">Genre</h3>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {genresData?.genres?.map((genre) => (
              <div key={genre.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`genre-${genre.id}`}
                  checked={selectedGenres.includes(genre.id)}
                  onCheckedChange={(checked) => handleGenreChange(genre.id, checked as boolean)}
                />
                <Label
                  htmlFor={`genre-${genre.id}`}
                  className="text-sm text-gray-300 hover:text-white cursor-pointer"
                >
                  {genre.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6 bg-gray-700" />

        {/* Region Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-4 w-4 text-cinema-gold" />
            <h3 className="font-semibold text-white">Region</h3>
          </div>
          <div className="space-y-2">
            {regions.map((region) => (
              <div key={region.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`region-${region.id}`}
                  checked={selectedRegions.includes(region.id)}
                  onCheckedChange={(checked) => handleRegionChange(region.id, checked as boolean)}
                />
                <Label
                  htmlFor={`region-${region.id}`}
                  className="text-sm text-gray-300 hover:text-white cursor-pointer flex items-center gap-2"
                >
                  <span>{region.flag}</span>
                  {region.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6 bg-gray-700" />

        {/* Release Year */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-cinema-gold" />
            <h3 className="font-semibold text-white">Release Year</h3>
          </div>
          <div className="space-y-3">
            <div className="px-2">
              <Slider
                value={releaseYear}
                onValueChange={setReleaseYear}
                max={new Date().getFullYear()}
                min={1950}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1950</span>
                <span className="text-cinema-gold font-medium">{releaseYear[0]}</span>
                <span>{new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-gray-700" />

        {/* IMDb Rating */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 text-cinema-gold" />
            <h3 className="font-semibold text-white">Minimum Rating</h3>
          </div>
          <div className="space-y-3">
            <div className="px-2">
              <Slider
                value={rating}
                onValueChange={setRating}
                max={10}
                min={0}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0.0</span>
                <span className="text-cinema-gold font-medium">{rating[0].toFixed(1)}+</span>
                <span>10.0</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-gray-700" />

        {/* Duration */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-cinema-gold" />
            <h3 className="font-semibold text-white">Duration</h3>
          </div>
          <RadioGroup value={runtime} onValueChange={setRuntime}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="any" id="duration-any" />
              <Label htmlFor="duration-any" className="text-sm text-gray-300 hover:text-white cursor-pointer">
                Any Duration
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="under90" id="duration-under90" />
              <Label htmlFor="duration-under90" className="text-sm text-gray-300 hover:text-white cursor-pointer">
                Under 90 min
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="90to120" id="duration-90to120" />
              <Label htmlFor="duration-90to120" className="text-sm text-gray-300 hover:text-white cursor-pointer">
                90-120 min
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="over120" id="duration-over120" />
              <Label htmlFor="duration-over120" className="text-sm text-gray-300 hover:text-white cursor-pointer">
                Over 120 min
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator className="my-6 bg-gray-700" />

        {/* Age Rating */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-cinema-gold" />
            <h3 className="font-semibold text-white">Age Rating</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {ageRatings.map((ageRating) => (
              <Button
                key={ageRating}
                variant={selectedAgeRatings.includes(ageRating) ? "default" : "outline"}
                size="sm"
                className={`${
                  selectedAgeRatings.includes(ageRating)
                    ? "bg-cinema-gold text-cinema-dark hover:bg-cinema-accent"
                    : "border-gray-600 hover:border-cinema-gold"
                }`}
                onClick={() => handleAgeRatingChange(ageRating, !selectedAgeRatings.includes(ageRating))}
              >
                {ageRating}
              </Button>
            ))}
          </div>
        </div>

        <Separator className="my-6 bg-gray-700" />

        {/* Clear Filters */}
        <Button
          variant="destructive"
          className="w-full bg-cinema-red hover:bg-red-700"
          onClick={clearAllFilters}
          disabled={getActiveFiltersCount() === 0}
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );
}
