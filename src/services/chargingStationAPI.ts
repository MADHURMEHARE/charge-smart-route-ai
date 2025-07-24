import { supabase } from '@/integrations/supabase/client';
import { Station } from '@/hooks/useRealTime';

// Real charging station API integration
export class ChargingStationAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_CHARGING_API_KEY || '';
    this.baseUrl = import.meta.env.VITE_CHARGING_API_URL || '';
  }

  // Fetch real charging station data from external APIs
  async fetchRealStations(latitude: number, longitude: number, radius: number = 10): Promise<Station[]> {
    try {
      // Example integration with OpenChargeMap API
      const response = await fetch(
        `${this.baseUrl}/poi?key=${this.apiKey}&latitude=${latitude}&longitude=${longitude}&radius=${radius}&maxresults=50`
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform external API data to our format
      return data.map((station: any) => ({
        id: station.ID,
        name: station.AddressInfo?.Title || 'Unknown Station',
        location: station.AddressInfo?.Town || station.AddressInfo?.State || 'Unknown Location',
        status: this.mapStatus(station.StatusType?.IsOperational),
        available: station.NumberOfPoints || 0,
        total: station.NumberOfPoints || 1,
        currentPower: `${station.Connections?.[0]?.PowerKW || 0} kW`,
        sessionTime: '0 min', // Would need real-time data
        efficiency: Math.floor(Math.random() * 100), // Would need real data
        lastUpdate: new Date().toISOString(),
        latitude: station.AddressInfo?.Latitude,
        longitude: station.AddressInfo?.Longitude,
        price: station.Connections?.[0]?.UsageCost || 'Free',
        type: station.Connections?.[0]?.ConnectionType?.Title || 'Standard'
      }));

    } catch (error) {
      console.error('Error fetching real station data:', error);
      return [];
    }
  }

  // Map external API status to our format
  private mapStatus(isOperational: boolean): 'active' | 'maintenance' | 'offline' {
    if (isOperational === true) return 'active';
    if (isOperational === false) return 'offline';
    return 'maintenance';
  }

  // Sync real data to our database
  async syncRealData(latitude: number, longitude: number, radius: number = 10): Promise<void> {
    try {
      const realStations = await this.fetchRealStations(latitude, longitude, radius);
      
      for (const station of realStations) {
        // Upsert station data
        const { error } = await supabase
          .from('stations')
          .upsert(station, { onConflict: 'id' });

        if (error) {
          console.error('Error syncing station:', error);
        }
      }

      console.log(`Synced ${realStations.length} stations from real API`);
    } catch (error) {
      console.error('Error syncing real data:', error);
    }
  }

  // Get user's location and fetch nearby stations
  async getNearbyStations(): Promise<Station[]> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const stations = await this.fetchRealStations(latitude, longitude);
            resolve(stations);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Update station status based on real-time data
  async updateStationStatus(stationId: number, status: 'active' | 'maintenance' | 'offline'): Promise<void> {
    try {
      const { error } = await supabase
        .from('stations')
        .update({ 
          status,
          lastUpdate: new Date().toISOString()
        })
        .eq('id', stationId);

      if (error) {
        throw error;
      }

      console.log(`Updated station ${stationId} status to ${status}`);
    } catch (error) {
      console.error('Error updating station status:', error);
    }
  }

  // Get charging session data
  async getChargingSessions(stationId: number): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('charging_sessions')
        .select('*')
        .eq('station_id', stationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching charging sessions:', error);
      return [];
    }
  }

  // Start a charging session
  async startChargingSession(stationId: number, userId: string): Promise<string> {
    try {
      const sessionData = {
        user_id: userId,
        station_id: stationId,
        start_time: new Date().toISOString(),
        status: 'active'
      };

      const { data, error } = await supabase
        .from('charging_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error starting charging session:', error);
      throw error;
    }
  }

  // End a charging session
  async endChargingSession(sessionId: string, energyConsumed: number, cost: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('charging_sessions')
        .update({
          end_time: new Date().toISOString(),
          energy_consumed: energyConsumed,
          cost: cost,
          status: 'completed'
        })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error ending charging session:', error);
      throw error;
    }
  }

  // Get station analytics
  async getStationAnalytics(stationId: number): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('station_analytics')
        .select('*')
        .eq('id', stationId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching station analytics:', error);
      return null;
    }
  }

  // Update metrics based on real usage
  async updateMetrics(): Promise<void> {
    try {
      // Calculate real metrics from charging sessions
      const { data: sessions } = await supabase
        .from('charging_sessions')
        .select('*')
        .eq('status', 'active');

      const { data: stations } = await supabase
        .from('stations')
        .select('*')
        .eq('status', 'active');

      const activeSessions = sessions?.length || 0;
      const totalStations = stations?.length || 0;
      const onlineStations = stations?.filter(s => s.status === 'active').length || 0;

      // Update metrics
      const { error } = await supabase
        .from('metrics')
        .update({
          activeSessions,
          totalStations,
          onlineStations,
          totalPower: `${(activeSessions * 50).toFixed(1)} MW`, // Estimate
          networkUptime: `${((onlineStations / totalStations) * 100).toFixed(1)}%`,
          avgResponseTime: '2.3s' // Would need real monitoring
        })
        .eq('id', 1);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  }
}

// Export singleton instance
export const chargingStationAPI = new ChargingStationAPI(); 