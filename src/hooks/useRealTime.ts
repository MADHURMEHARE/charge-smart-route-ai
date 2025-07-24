import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Station {
  id: number;
  name: string;
  location: string;
  status: 'active' | 'maintenance' | 'offline';
  available: number;
  total: number;
  currentPower: string;
  sessionTime: string;
  efficiency: number;
  lastUpdate: string;
  latitude?: number;
  longitude?: number;
  price: string;
  type: string;
}

export interface Alert {
  id: number;
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  time: string;
  location: string;
  isRead: boolean;
}

export interface LiveMetrics {
  activeSessions: number;
  totalPower: string;
  networkUptime: string;
  avgResponseTime: string;
  totalStations: number;
  onlineStations: number;
}

export const useRealTime = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [metrics, setMetrics] = useState<LiveMetrics>({
    activeSessions: 1247,
    totalPower: "45.2 MW",
    networkUptime: "99.7%",
    avgResponseTime: "2.3s",
    totalStations: 1247,
    onlineStations: 1234
  });
  const [isConnected, setIsConnected] = useState(false);

  // Initialize real-time subscriptions
  useEffect(() => {
    const setupRealTimeSubscriptions = async () => {
      try {
        // Subscribe to station updates
        const stationsSubscription = supabase
          .channel('stations')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'stations' },
            (payload) => {
              console.log('Station update:', payload);
              handleStationUpdate(payload);
            }
          )
          .subscribe();

        // Subscribe to alerts
        const alertsSubscription = supabase
          .channel('alerts')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'alerts' },
            (payload) => {
              console.log('Alert update:', payload);
              handleAlertUpdate(payload);
            }
          )
          .subscribe();

        // Subscribe to metrics
        const metricsSubscription = supabase
          .channel('metrics')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'metrics' },
            (payload) => {
              console.log('Metrics update:', payload);
              handleMetricsUpdate(payload);
            }
          )
          .subscribe();

        // Connection status
        supabase
          .channel('system')
          .on('system', { event: 'disconnect' }, () => {
            setIsConnected(false);
            toast({
              title: "Connection Lost",
              description: "Real-time connection has been lost. Attempting to reconnect...",
              variant: "destructive",
            });
          })
          .on('system', { event: 'reconnect' }, () => {
            setIsConnected(true);
            toast({
              title: "Reconnected",
              description: "Real-time connection has been restored.",
              variant: "default",
            });
          })
          .subscribe();

        setIsConnected(true);

        // Load initial data
        await loadInitialData();

        return () => {
          stationsSubscription.unsubscribe();
          alertsSubscription.unsubscribe();
          metricsSubscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up real-time subscriptions:', error);
        setIsConnected(false);
      }
    };

    setupRealTimeSubscriptions();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load initial stations data
      const { data: stationsData, error: stationsError } = await supabase
        .from('stations')
        .select('*')
        .order('lastUpdate', { ascending: false });

      if (stationsError) throw stationsError;
      if (stationsData) setStations(stationsData);

      // Load initial alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (alertsError) throw alertsError;
      if (alertsData) setAlerts(alertsData);

      // Load initial metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('metrics')
        .select('*')
        .single();

      if (metricsError) throw metricsError;
      if (metricsData) setMetrics(metricsData);

    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleStationUpdate = useCallback((payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    setStations(prevStations => {
      switch (eventType) {
        case 'INSERT':
          return [newRecord, ...prevStations];
        case 'UPDATE':
          return prevStations.map(station => 
            station.id === newRecord.id ? newRecord : station
          );
        case 'DELETE':
          return prevStations.filter(station => station.id !== oldRecord.id);
        default:
          return prevStations;
      }
    });

    // Show notification for important updates
    if (eventType === 'UPDATE' && newRecord.status !== oldRecord?.status) {
      toast({
        title: `Station ${newRecord.name}`,
        description: `Status changed to ${newRecord.status}`,
        variant: newRecord.status === 'active' ? 'default' : 'destructive',
      });
    }
  }, []);

  const handleAlertUpdate = useCallback((payload: any) => {
    const { eventType, new: newRecord } = payload;

    setAlerts(prevAlerts => {
      switch (eventType) {
        case 'INSERT':
          // Show toast for new alerts
          toast({
            title: newRecord.type === 'warning' ? '⚠️ Warning' : 
                   newRecord.type === 'error' ? '🚨 Error' : 'ℹ️ Info',
            description: newRecord.message,
            variant: newRecord.type === 'warning' || newRecord.type === 'error' ? 'destructive' : 'default',
          });
          return [newRecord, ...prevAlerts];
        case 'UPDATE':
          return prevAlerts.map(alert => 
            alert.id === newRecord.id ? newRecord : alert
          );
        case 'DELETE':
          return prevAlerts.filter(alert => alert.id !== newRecord.id);
        default:
          return prevAlerts;
      }
    });
  }, []);

  const handleMetricsUpdate = useCallback((payload: any) => {
    const { new: newRecord } = payload;
    if (newRecord) {
      setMetrics(newRecord);
    }
  }, []);

  const dismissAlert = async (alertId: number) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ isRead: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId ? { ...alert, isRead: true } : alert
        )
      );
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const updateStationStatus = async (stationId: number, status: Station['status']) => {
    try {
      const { error } = await supabase
        .from('stations')
        .update({ 
          status,
          lastUpdate: new Date().toISOString()
        })
        .eq('id', stationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating station status:', error);
    }
  };

  return {
    stations,
    alerts,
    metrics,
    isConnected,
    dismissAlert,
    updateStationStatus,
  };
}; 