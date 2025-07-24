import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Filter, Zap, Clock, Battery, Navigation, Building, Sparkles, Lightbulb } from "lucide-react";
import NavBar from "@/components/NavBar";
import { kaggleDataService, ProcessedStation } from "@/services/kaggleDataService";
import { aiSearchService, SearchResult } from "@/services/aiSearchService";

const Stations = () => {
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [filteredStations, setFilteredStations] = useState<ProcessedStation[]>([]);
  const [allStations, setAllStations] = useState<ProcessedStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<any>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [popularSearches] = useState(aiSearchService.getPopularSearches());

  // Load Kaggle data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const stations = await kaggleDataService.getAllStations();
        const stats = await kaggleDataService.getStatistics();
        setAllStations(stations);
        setFilteredStations(stations);
        setStatistics(stats);
      } catch (error) {
        console.error('Error loading stations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // AI-powered search
  useEffect(() => {
    const performAISearch = async () => {
      if (!search.trim()) {
        setFilteredStations(allStations);
        setSearchResult(null);
        return;
      }

      try {
        const result = await aiSearchService.searchStations(search, allStations);
        setFilteredStations(result.stations);
        setSearchResult(result);
      } catch (error) {
        console.error('AI search error:', error);
        // Fallback to basic search
        const basicFiltered = allStations.filter(station =>
          station.name.toLowerCase().includes(search.toLowerCase()) ||
          station.address.toLowerCase().includes(search.toLowerCase()) ||
          station.location.toLowerCase().includes(search.toLowerCase()) ||
          station.state.toLowerCase().includes(search.toLowerCase()) ||
          station.operator.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredStations(basicFiltered);
      }
    };

    const debounceTimer = setTimeout(performAISearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [search, allStations]);

  // Filter stations by location
  useEffect(() => {
    if (selectedLocation) {
      const locationFiltered = allStations.filter(station => 
        station.location === selectedLocation || 
        station.state === selectedLocation
      );
      setFilteredStations(locationFiltered);
    }
  }, [selectedLocation, allStations]);

  const handleNavigate = (station: ProcessedStation) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(station.address)}`;
    window.open(url, "_blank");
  };

  const getAvailabilityBadge = (station: ProcessedStation) => {
    const percentage = (station.available / station.total) * 100;
    if (station.status === 'offline') return <Badge variant="destructive">Offline</Badge>;
    if (station.status === 'maintenance') return <Badge variant="secondary">Maintenance</Badge>;
    if (percentage > 50) return <Badge variant="default">Available</Badge>;
    if (percentage > 0) return <Badge variant="secondary">Limited</Badge>;
    return <Badge variant="destructive">Full</Badge>;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'maintenance': return 'text-yellow-600';
      case 'offline': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handlePopularSearch = (popularQuery: string) => {
    setSearch(popularQuery);
    setSelectedLocation("");
  };

  const locations = Array.from(new Set(allStations.map(station => station.location))).sort();
  const states = Array.from(new Set(allStations.map(station => station.state))).sort();

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-6 py-8 pt-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Charging Stations</h1>
          <p className="text-muted-foreground">Find and navigate to nearby EV charging stations using AI-powered search</p>
        </div>

        {/* AI Search Section */}
        <div className="mb-8">
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Search</span>
            </div>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Try: 'Find fast charging stations in Mumbai' or 'Tata Power stations near airports'..."
              className="pl-10 pr-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
            />
            {search && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
            )}
          </div>

          {/* AI Search Results Info */}
          {searchResult && (
            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary mb-1">
                    {searchResult.explanation}
                  </p>
                  {searchResult.suggestions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Suggestions:</p>
                      <div className="flex flex-wrap gap-2">
                        {searchResult.suggestions.map((suggestion, index) => (
                          <Badge key={index} variant="outline" className="text-xs cursor-pointer hover:bg-primary/10">
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Popular Searches */}
          {showSuggestions && !search && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Popular searches:</p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((popularQuery, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handlePopularSearch(popularQuery)}
                  >
                    {popularQuery}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Traditional Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
          <div className="w-64">
            <select
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => { 
              setSearch(""); 
              setSelectedLocation(""); 
              setFilteredStations(allStations); 
              setSearchResult(null);
              setShowSuggestions(false);
            }}
          >
            <Filter className="w-4 h-4" />
            Clear
          </Button>
        </div>

        {/* Stats */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Stations</p>
                    <p className="text-2xl font-bold">{statistics.totalStations}</p>
                  </div>
                  <Zap className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Ports</p>
                    <p className="text-2xl font-bold">{statistics.availablePorts}</p>
                  </div>
                  <Battery className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Rating</p>
                    <p className="text-2xl font-bold">{statistics.avgRating}</p>
                  </div>
                  <Clock className="h-8 w-8 text-warning" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cities Covered</p>
                    <p className="text-2xl font-bold">{statistics.cities}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stations List */}
        {loading ? (
          <div className="text-center py-12 text-lg text-muted-foreground">Loading Kaggle dataset...</div>
        ) : filteredStations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-lg text-muted-foreground mb-4">No stations found</div>
            <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
            {searchResult?.suggestions && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Try these searches:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {searchResult.suggestions.map((suggestion, index) => (
                    <Badge key={index} variant="outline" className="cursor-pointer hover:bg-primary/10">
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStations.map((station) => (
              <Card key={station.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{station.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        {station.location}, {station.state}
                      </div>
                    </div>
                    {getAvailabilityBadge(station)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{station.address}</p>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Operator:</span>
                      <span className="font-medium">{station.operator}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Battery className="w-4 h-4" />
                        {station.available}/{station.total} ports
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        {station.powerOutput}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(station.status)}`}></span>
                        {station.status}
                      </span>
                      <span className="text-muted-foreground">
                        {station.rating} ⭐ ({station.reviews} reviews)
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Last updated: {new Date(station.lastUpdated).toLocaleDateString()}
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {station.connectorType}
                      </Badge>
                      <Button 
                        size="sm" 
                        className="bg-electric-gradient" 
                        onClick={() => handleNavigate(station)}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Navigate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stations; 