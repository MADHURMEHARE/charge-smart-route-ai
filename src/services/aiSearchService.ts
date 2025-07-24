// AI-Powered Search Service for EV Charging Stations
// Handles natural language queries and intelligent search

import { ProcessedStation } from './kaggleDataService';

export interface SearchQuery {
  query: string;
  intent: 'find_stations' | 'filter_by_type' | 'filter_by_location' | 'filter_by_operator' | 'get_recommendations';
  filters: {
    location?: string;
    connectorType?: string;
    operator?: string;
    powerOutput?: string;
    status?: string;
    hasNearbyAmenities?: string[];
  };
}

export interface SearchResult {
  stations: ProcessedStation[];
  explanation: string;
  suggestions: string[];
  confidence: number;
}

class AISearchService {
  private keywords = {
    locations: ['mumbai', 'delhi', 'bangalore', 'pune', 'hyderabad', 'chennai', 'kolkata', 'ahmedabad', 'indore', 'jaipur', 'lucknow'],
    operators: ['tata power', 'eesl', 'ndmc', 'bescom', 'bial', 'tsredco', 'tangedco', 'wbsedcl', 'guvnl', 'mpseb', 'rvpn', 'uppcl'],
    connectorTypes: ['type 2', 'ccs', 'fast', 'slow', 'standard'],
    amenities: ['coffee', 'restaurant', 'mall', 'airport', 'highway', 'parking', 'shopping'],
    powerLevels: ['fast', 'slow', 'high', 'low', '22kw', '50kw', '60kw', '7.4kw'],
    status: ['available', 'busy', 'free', 'occupied', 'maintenance', 'offline']
  };

  // Main search function that understands natural language
  async searchStations(query: string, allStations: ProcessedStation[]): Promise<SearchResult> {
    const processedQuery = this.processQuery(query.toLowerCase());
    const filteredStations = this.applyFilters(allStations, processedQuery.filters);
    
    return {
      stations: filteredStations,
      explanation: this.generateExplanation(processedQuery),
      suggestions: this.generateSuggestions(processedQuery, filteredStations.length),
      confidence: this.calculateConfidence(processedQuery)
    };
  }

  // Process natural language query into structured filters
  private processQuery(query: string): SearchQuery {
    const words = query.split(' ');
    const filters: any = {};

    // Extract location
    const locationMatch = this.keywords.locations.find(loc => query.includes(loc));
    if (locationMatch) {
      filters.location = locationMatch;
    }

    // Extract operator
    const operatorMatch = this.keywords.operators.find(op => query.includes(op));
    if (operatorMatch) {
      filters.operator = operatorMatch;
    }

    // Extract connector type
    const connectorMatch = this.keywords.connectorTypes.find(conn => query.includes(conn));
    if (connectorMatch) {
      filters.connectorType = connectorMatch;
    }

    // Extract power output
    const powerMatch = this.keywords.powerLevels.find(power => query.includes(power));
    if (powerMatch) {
      filters.powerOutput = powerMatch;
    }

    // Extract amenities
    const amenityMatches = this.keywords.amenities.filter(amenity => query.includes(amenity));
    if (amenityMatches.length > 0) {
      filters.hasNearbyAmenities = amenityMatches;
    }

    // Determine intent
    let intent: SearchQuery['intent'] = 'find_stations';
    if (query.includes('near') || query.includes('close to')) {
      intent = 'filter_by_location';
    } else if (query.includes('fast') || query.includes('slow') || query.includes('type')) {
      intent = 'filter_by_type';
    } else if (operatorMatch) {
      intent = 'filter_by_operator';
    } else if (query.includes('recommend') || query.includes('suggest')) {
      intent = 'get_recommendations';
    }

    return {
      query,
      intent,
      filters
    };
  }

  // Apply filters to stations
  private applyFilters(stations: ProcessedStation[], filters: any): ProcessedStation[] {
    let filtered = stations;

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(station => 
        station.location.toLowerCase().includes(filters.location) ||
        station.state.toLowerCase().includes(filters.location)
      );
    }

    // Filter by operator
    if (filters.operator) {
      filtered = filtered.filter(station =>
        station.operator.toLowerCase().includes(filters.operator)
      );
    }

    // Filter by connector type
    if (filters.connectorType) {
      if (filters.connectorType === 'fast' || filters.connectorType === 'ccs') {
        filtered = filtered.filter(station => station.connectorType === 'CCS');
      } else if (filters.connectorType === 'slow' || filters.connectorType === 'type 2') {
        filtered = filtered.filter(station => station.connectorType === 'Type 2');
      }
    }

    // Filter by power output
    if (filters.powerOutput) {
      if (filters.powerOutput.includes('fast') || filters.powerOutput.includes('high')) {
        filtered = filtered.filter(station => 
          station.powerOutput.includes('50') || station.powerOutput.includes('60')
        );
      } else if (filters.powerOutput.includes('slow') || filters.powerOutput.includes('low')) {
        filtered = filtered.filter(station => 
          station.powerOutput.includes('7.4') || station.powerOutput.includes('22')
        );
      }
    }

    // Filter by amenities (simplified - based on station names)
    if (filters.hasNearbyAmenities) {
      filtered = filtered.filter(station => {
        const stationText = `${station.name} ${station.address}`.toLowerCase();
        return filters.hasNearbyAmenities.some((amenity: string) => 
          stationText.includes(amenity)
        );
      });
    }

    return filtered;
  }

  // Generate explanation for search results
  private generateExplanation(processedQuery: SearchQuery): string {
    const { intent, filters } = processedQuery;
    
    switch (intent) {
      case 'filter_by_location':
        return `Found stations ${filters.location ? `in ${filters.location}` : 'nearby'}`;
      
      case 'filter_by_type':
        if (filters.connectorType === 'CCS' || filters.connectorType === 'fast') {
          return 'Showing fast charging stations (CCS)';
        } else if (filters.connectorType === 'Type 2' || filters.connectorType === 'slow') {
          return 'Showing standard charging stations (Type 2)';
        }
        return 'Showing stations by type';
      
      case 'filter_by_operator':
        return `Showing stations operated by ${filters.operator}`;
      
      case 'get_recommendations':
        return 'Here are some recommended stations based on your query';
      
      default:
        return 'Showing all available stations';
    }
  }

  // Generate search suggestions
  private generateSuggestions(processedQuery: SearchQuery, resultCount: number): string[] {
    const suggestions = [];

    if (resultCount === 0) {
      suggestions.push('Try searching for a different location');
      suggestions.push('Try "fast charging" or "Type 2" stations');
      suggestions.push('Try searching by operator like "Tata Power"');
    } else if (resultCount < 3) {
      suggestions.push('Try expanding your search area');
      suggestions.push('Try different connector types');
    } else {
      suggestions.push('Try filtering by "fast charging" for quicker charging');
      suggestions.push('Try searching by specific operators');
    }

    return suggestions;
  }

  // Calculate confidence score for search
  private calculateConfidence(processedQuery: SearchQuery): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on specific filters
    if (processedQuery.filters.location) confidence += 0.2;
    if (processedQuery.filters.operator) confidence += 0.15;
    if (processedQuery.filters.connectorType) confidence += 0.15;
    if (processedQuery.filters.powerOutput) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  // Get search suggestions based on query
  getSearchSuggestions(query: string): string[] {
    const suggestions = [];
    
    if (query.includes('near') || query.includes('close')) {
      suggestions.push('Find stations near coffee shops');
      suggestions.push('Find stations near airports');
      suggestions.push('Find stations near malls');
    }
    
    if (query.includes('fast') || query.includes('quick')) {
      suggestions.push('Show me fast charging stations');
      suggestions.push('Find CCS charging stations');
    }
    
    if (query.includes('operator') || query.includes('company')) {
      suggestions.push('Find Tata Power stations');
      suggestions.push('Find EESL stations');
    }
    
    return suggestions;
  }

  // Get popular search queries
  getPopularSearches(): string[] {
    return [
      'Find stations near me',
      'Show fast charging stations',
      'Tata Power stations',
      'Airport charging stations',
      'Mall charging stations',
      'Highway charging stations'
    ];
  }
}

// Export singleton instance
export const aiSearchService = new AISearchService(); 