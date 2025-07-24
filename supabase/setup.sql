-- ChargeSmart Database Setup Script
-- Run this in your Supabase SQL Editor

-- 1. Create stations table
CREATE TABLE IF NOT EXISTS stations (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  location VARCHAR NOT NULL,
  status VARCHAR CHECK (status IN ('active', 'maintenance', 'offline')) DEFAULT 'active',
  available INTEGER NOT NULL,
  total INTEGER NOT NULL,
  currentPower VARCHAR NOT NULL,
  sessionTime VARCHAR NOT NULL,
  efficiency INTEGER NOT NULL,
  lastUpdate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  latitude DECIMAL,
  longitude DECIMAL,
  price VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  type VARCHAR CHECK (type IN ('warning', 'info', 'success', 'error')) NOT NULL,
  message VARCHAR NOT NULL,
  time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location VARCHAR NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create metrics table
CREATE TABLE IF NOT EXISTS metrics (
  id SERIAL PRIMARY KEY,
  activeSessions INTEGER NOT NULL,
  totalPower VARCHAR NOT NULL,
  networkUptime VARCHAR NOT NULL,
  avgResponseTime VARCHAR NOT NULL,
  totalStations INTEGER NOT NULL,
  onlineStations INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for anonymous access (for demo/development)
-- Stations policies
CREATE POLICY "Allow anonymous read access to stations" ON stations FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access to stations" ON stations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access to stations" ON stations FOR UPDATE USING (true);

-- Alerts policies
CREATE POLICY "Allow anonymous read access to alerts" ON alerts FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access to alerts" ON alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access to alerts" ON alerts FOR UPDATE USING (true);

-- Metrics policies
CREATE POLICY "Allow anonymous read access to metrics" ON metrics FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access to metrics" ON metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access to metrics" ON metrics FOR UPDATE USING (true);

-- 6. Enable real-time subscriptions
-- Note: This requires the realtime extension to be enabled in your Supabase project
-- Go to your Supabase dashboard > Settings > Database > Extensions and enable 'realtime'

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE stations;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE metrics;

-- 7. Insert initial data for testing
INSERT INTO stations (name, location, status, available, total, currentPower, sessionTime, efficiency, latitude, longitude, price, type) VALUES
  ('Phoenix Mall Hub', 'Mumbai', 'active', 8, 12, '45.2 kW', '32 min', 67, 19.0760, 72.8777, '₹15/kWh', 'Fast Charging'),
  ('Cyber City Station', 'Bangalore', 'active', 15, 20, '67.8 kW', '45 min', 75, 12.9716, 77.5946, '₹18/kWh', 'Ultra Fast'),
  ('Khan Market Charging', 'Delhi', 'active', 3, 8, '18.7 kW', '28 min', 37, 28.7041, 77.1025, '₹12/kWh', 'Standard'),
  ('Express Highway', 'Pune', 'active', 22, 30, '89.3 kW', '52 min', 73, 18.5204, 73.8567, '₹16/kWh', 'Fast Charging')
ON CONFLICT (id) DO NOTHING;

INSERT INTO metrics (activeSessions, totalPower, networkUptime, avgResponseTime, totalStations, onlineStations) VALUES
  (1247, '45.2 MW', '99.7%', '2.3s', 1247, 1234)
ON CONFLICT (id) DO NOTHING;

INSERT INTO alerts (type, message, location) VALUES
  ('info', 'System initialized successfully', 'System'),
  ('success', 'Network efficiency at optimal levels', 'System')
ON CONFLICT (id) DO NOTHING;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stations_status ON stations(status);
CREATE INDEX IF NOT EXISTS idx_stations_location ON stations(location);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_isread ON alerts(isRead);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);

-- 9. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create triggers to automatically update updated_at
CREATE TRIGGER update_stations_updated_at BEFORE UPDATE ON stations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_metrics_updated_at BEFORE UPDATE ON metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Database setup completed successfully!' as status; 