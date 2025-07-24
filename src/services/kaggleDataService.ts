// Kaggle Dataset Service for EV Charging Stations
// Dataset: https://www.kaggle.com/datasets/saketpradhan/electric-vehicle-charging-stations-in-india

import kaggleStationsData from '@/data/ev_stations.json';

export interface KaggleStation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  operator: string;
  connector_type: string;
  power_output: string;
  status: string;
  last_updated: string;
}

export interface ProcessedStation {
  id: string;
  name: string;
  address: string;
  location: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  operator: string;
  connectorType: string;
  powerOutput: string;
  status: 'active' | 'maintenance' | 'offline';
  lastUpdated: string;
  available: number;
  total: number;
  rating: number;
  reviews: number;
  distance?: string;
}

class KaggleDataService {
  private stations: ProcessedStation[] = [];
  private isLoaded = false;

  // Load data from Kaggle dataset
  async loadKaggleData(): Promise<ProcessedStation[]> {
    if (this.isLoaded) {
      return this.stations;
    }

    try {
      // Load data from the JSON file
      const rawData: KaggleStation[] = kaggleStationsData;
      this.stations = this.processKaggleData(rawData);
      this.isLoaded = true;
      
      return this.stations;
    } catch (error) {
      console.error('Error loading Kaggle data:', error);
      return [];
    }
  }

  // Process raw Kaggle data into our app format
  private processKaggleData(rawData: KaggleStation[]): ProcessedStation[] {
    return rawData.map((station, index) => ({
      id: station.id,
      name: station.name,
      address: station.address,
      location: station.city,
      state: station.state,
      coordinates: {
        lat: station.latitude,
        lng: station.longitude
      },
      operator: station.operator,
      connectorType: station.connector_type,
      powerOutput: station.power_output,
      status: this.mapStatus(station.status),
      lastUpdated: station.last_updated,
      available: this.generateAvailability(station.status),
      total: this.generateTotalPorts(station.connector_type),
      rating: this.generateRating(),
      reviews: this.generateReviews()
    }));
  }

  // Map Kaggle status to our app status
  private mapStatus(status: string): 'active' | 'maintenance' | 'offline' {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('operational') || statusLower.includes('active')) {
      return 'active';
    }
    if (statusLower.includes('maintenance') || statusLower.includes('repair')) {
      return 'maintenance';
    }
    return 'offline';
  }

  // Generate realistic availability based on status
  private generateAvailability(status: string): number {
    if (status.toLowerCase().includes('operational')) {
      return Math.floor(Math.random() * 8) + 2; // 2-10 available
    }
    return 0;
  }

  // Generate total ports based on connector type
  private generateTotalPorts(connectorType: string): number {
    if (connectorType.includes('CCS')) {
      return Math.floor(Math.random() * 4) + 2; // 2-6 ports for fast charging
    }
    return Math.floor(Math.random() * 6) + 4; // 4-10 ports for standard
  }

  // Generate realistic rating
  private generateRating(): number {
    return Math.round((Math.random() * 2 + 3) * 10) / 10; // 3.0-5.0
  }

  // Generate realistic review count
  private generateReviews(): number {
    return Math.floor(Math.random() * 500) + 50; // 50-550 reviews
  }

  // Get all stations
  async getAllStations(): Promise<ProcessedStation[]> {
    return this.loadKaggleData();
  }

  // Search stations by query
  async searchStations(query: string): Promise<ProcessedStation[]> {
    const stations = await this.loadKaggleData();
    const queryLower = query.toLowerCase();
    
    return stations.filter(station =>
      station.name.toLowerCase().includes(queryLower) ||
      station.address.toLowerCase().includes(queryLower) ||
      station.location.toLowerCase().includes(queryLower) ||
      station.state.toLowerCase().includes(queryLower) ||
      station.operator.toLowerCase().includes(queryLower)
    );
  }

  // Filter stations by location
  async getStationsByLocation(location: string): Promise<ProcessedStation[]> {
    const stations = await this.loadKaggleData();
    
    if (!location) return stations;
    
    return stations.filter(station =>
      station.location.toLowerCase() === location.toLowerCase() ||
      station.state.toLowerCase() === location.toLowerCase()
    );
  }

  // Get stations by status
  async getStationsByStatus(status: 'active' | 'maintenance' | 'offline'): Promise<ProcessedStation[]> {
    const stations = await this.loadKaggleData();
    return stations.filter(station => station.status === status);
  }

  // Get stations by operator
  async getStationsByOperator(operator: string): Promise<ProcessedStation[]> {
    const stations = await this.loadKaggleData();
    return stations.filter(station =>
      station.operator.toLowerCase().includes(operator.toLowerCase())
    );
  }

  // Get statistics
  async getStatistics() {
    const stations = await this.loadKaggleData();
    
    const totalStations = stations.length;
    const activeStations = stations.filter(s => s.status === 'active').length;
    const totalPorts = stations.reduce((sum, s) => sum + s.total, 0);
    const availablePorts = stations.reduce((sum, s) => sum + s.available, 0);
    const avgRating = stations.reduce((sum, s) => sum + s.rating, 0) / totalStations;
    
    const operators = [...new Set(stations.map(s => s.operator))];
    const cities = [...new Set(stations.map(s => s.location))];
    const states = [...new Set(stations.map(s => s.state))];

    return {
      totalStations,
      activeStations,
      totalPorts,
      availablePorts,
      avgRating: Math.round(avgRating * 10) / 10,
      operators: operators.length,
      cities: cities.length,
      states: states.length,
      utilization: Math.round((availablePorts / totalPorts) * 100)
    };
  }

  // Get stations near coordinates (simplified distance calculation)
  async getNearbyStations(lat: number, lng: number, radiusKm: number = 10): Promise<ProcessedStation[]> {
    const stations = await this.loadKaggleData();
    
    return stations.filter(station => {
      const distance = this.calculateDistance(
        lat, lng,
        station.coordinates.lat, station.coordinates.lng
      );
      return distance <= radiusKm;
    });
  }

  // Calculate distance between two points (Haversine formula)
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// Export singleton instance
export const kaggleDataService = new KaggleDataService(); 