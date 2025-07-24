import { supabase } from '@/integrations/supabase/client';

// Simulate real-time data updates
export class RealTimeSimulator {
  private interval: NodeJS.Timeout | null = null;
  public isRunning = false;

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Update stations every 5-15 seconds
    this.interval = setInterval(() => {
      this.updateRandomStation();
    }, Math.random() * 10000 + 5000);

    // Generate alerts occasionally
    setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance
        this.generateAlert();
      }
    }, 30000); // Every 30 seconds

    // Update metrics every 10 seconds
    setInterval(() => {
      this.updateMetrics();
    }, 10000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
  }

  private async updateRandomStation() {
    try {
      // Get all stations
      const { data: stations, error } = await supabase
        .from('stations')
        .select('*');

      if (error || !stations || stations.length === 0) {
        // If no stations exist, create some initial data
        await this.createInitialData();
        return;
      }

      // Pick a random station
      const randomStation = stations[Math.floor(Math.random() * stations.length)];
      
      // Generate random updates
      const updates: any = {
        lastUpdate: new Date().toISOString(),
      };

      // Randomly change status (10% chance)
      if (Math.random() < 0.1) {
        const statuses = ['active', 'maintenance', 'offline'] as const;
        updates.status = statuses[Math.floor(Math.random() * statuses.length)];
      }

      // Update available ports (random change)
      const availableChange = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      const newAvailable = Math.max(0, Math.min(randomStation.total, randomStation.available + availableChange));
      updates.available = newAvailable;

      // Update efficiency based on available ports
      updates.efficiency = Math.round((newAvailable / randomStation.total) * 100);

      // Update current power (simulate charging activity)
      if (randomStation.status === 'active') {
        const powerChange = (Math.random() - 0.5) * 20; // ±10 kW
        const currentPower = Math.max(0, parseFloat(randomStation.currentPower) + powerChange);
        updates.currentPower = `${currentPower.toFixed(1)} kW`;
      } else {
        updates.currentPower = '0 kW';
      }

      // Update session time
      if (randomStation.status === 'active' && randomStation.available < randomStation.total) {
        const sessionTime = Math.floor(Math.random() * 60) + 1;
        updates.sessionTime = `${sessionTime} min`;
      } else {
        updates.sessionTime = '0 min';
      }

      // Update the station
      await supabase
        .from('stations')
        .update(updates)
        .eq('id', randomStation.id);

    } catch (error) {
      console.error('Error updating station:', error);
    }
  }

  private async generateAlert() {
    try {
      const alertTypes = ['warning', 'info', 'success', 'error'] as const;
      const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad'];
      
      const alertMessages = [
        'Station maintenance scheduled for tomorrow',
        'New charging station added to network',
        'Network efficiency improved by 2%',
        'Power outage detected at Cyber City Station',
        'Peak charging hours detected',
        'Battery optimization completed',
        'Emergency maintenance required',
        'New ultra-fast charger installed',
        'Traffic congestion detected near station',
        'Weather alert: Heavy rain affecting charging'
      ];

      const newAlert = {
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        message: alertMessages[Math.floor(Math.random() * alertMessages.length)],
        time: new Date().toISOString(),
        location: locations[Math.floor(Math.random() * locations.length)],
        isRead: false
      };

      await supabase
        .from('alerts')
        .insert(newAlert);

    } catch (error) {
      console.error('Error generating alert:', error);
    }
  }

  private async updateMetrics() {
    try {
      // Get current metrics
      const { data: currentMetrics } = await supabase
        .from('metrics')
        .select('*')
        .single();

      if (!currentMetrics) {
        // Create initial metrics if they don't exist
        await this.createInitialMetrics();
        return;
      }

      // Generate realistic metric updates
      const updates: any = {
        activeSessions: Math.max(1000, currentMetrics.activeSessions + Math.floor(Math.random() * 100) - 50),
        totalPower: `${(parseFloat(currentMetrics.totalPower) + (Math.random() - 0.5) * 5).toFixed(1)} MW`,
        networkUptime: `${(parseFloat(currentMetrics.networkUptime) + (Math.random() - 0.5) * 0.5).toFixed(1)}%`,
        avgResponseTime: `${(parseFloat(currentMetrics.avgResponseTime) + (Math.random() - 0.5) * 0.5).toFixed(1)}s`,
        totalStations: currentMetrics.totalStations,
        onlineStations: Math.max(0, currentMetrics.onlineStations + Math.floor(Math.random() * 3) - 1)
      };

      // Ensure realistic bounds
      updates.activeSessions = Math.max(800, Math.min(2000, updates.activeSessions));
      updates.networkUptime = Math.max(95, Math.min(100, parseFloat(updates.networkUptime)));
      updates.avgResponseTime = Math.max(1, Math.min(5, parseFloat(updates.avgResponseTime)));

      await supabase
        .from('metrics')
        .update(updates)
        .eq('id', currentMetrics.id);

    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  }

  private async createInitialData() {
    try {
      // Create sample stations
      const stations = [
        {
          name: "Phoenix Mall Hub",
          location: "Mumbai",
          status: "active",
          available: 8,
          total: 12,
          currentPower: "45.2 kW",
          sessionTime: "32 min",
          efficiency: 67,
          lastUpdate: new Date().toISOString(),
          latitude: 19.0760,
          longitude: 72.8777,
          price: "₹15/kWh",
          type: "Fast Charging"
        },
        {
          name: "Cyber City Station",
          location: "Bangalore",
          status: "active",
          available: 15,
          total: 20,
          currentPower: "67.8 kW",
          sessionTime: "45 min",
          efficiency: 75,
          lastUpdate: new Date().toISOString(),
          latitude: 12.9716,
          longitude: 77.5946,
          price: "₹18/kWh",
          type: "Ultra Fast"
        },
        {
          name: "Khan Market Charging",
          location: "Delhi",
          status: "active",
          available: 3,
          total: 8,
          currentPower: "18.7 kW",
          sessionTime: "28 min",
          efficiency: 37,
          lastUpdate: new Date().toISOString(),
          latitude: 28.7041,
          longitude: 77.1025,
          price: "₹12/kWh",
          type: "Standard"
        },
        {
          name: "Express Highway",
          location: "Pune",
          status: "active",
          available: 22,
          total: 30,
          currentPower: "89.3 kW",
          sessionTime: "52 min",
          efficiency: 73,
          lastUpdate: new Date().toISOString(),
          latitude: 18.5204,
          longitude: 73.8567,
          price: "₹16/kWh",
          type: "Fast Charging"
        }
      ];

      for (const station of stations) {
        await supabase
          .from('stations')
          .insert(station);
      }

    } catch (error) {
      console.error('Error creating initial data:', error);
    }
  }

  private async createInitialMetrics() {
    try {
      const initialMetrics = {
        activeSessions: 1247,
        totalPower: "45.2 MW",
        networkUptime: "99.7%",
        avgResponseTime: "2.3s",
        totalStations: 1247,
        onlineStations: 1234
      };

      await supabase
        .from('metrics')
        .insert(initialMetrics);

    } catch (error) {
      console.error('Error creating initial metrics:', error);
    }
  }
}

// Export singleton instance
export const realTimeSimulator = new RealTimeSimulator(); 