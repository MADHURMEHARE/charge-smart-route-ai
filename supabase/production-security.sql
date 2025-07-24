-- Production Security Setup for ChargeSmart
-- Run this AFTER setting up authentication in your Supabase project

-- 1. Create users table for additional user data
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR NOT NULL,
  full_name VARCHAR,
  phone VARCHAR,
  preferred_location VARCHAR,
  notification_preferences JSONB DEFAULT '{"station_alerts": true, "maintenance_alerts": true, "price_updates": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user sessions table for tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create charging sessions table for real usage tracking
CREATE TABLE IF NOT EXISTS charging_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  station_id INTEGER REFERENCES stations(id),
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  energy_consumed DECIMAL(10,2),
  cost DECIMAL(10,2),
  status VARCHAR CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS on new tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE charging_sessions ENABLE ROW LEVEL SECURITY;

-- 5. Production Security Policies

-- User Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User Sessions: Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Charging Sessions: Users can only see their own charging sessions
CREATE POLICY "Users can view own charging sessions" ON charging_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own charging sessions" ON charging_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own charging sessions" ON charging_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Stations: Public read access, authenticated users can update
CREATE POLICY "Public can view stations" ON stations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update stations" ON stations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Alerts: Public read access, system can insert
CREATE POLICY "Public can view alerts" ON alerts
  FOR SELECT USING (true);

CREATE POLICY "System can insert alerts" ON alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update alerts" ON alerts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Metrics: Public read access, system can update
CREATE POLICY "Public can view metrics" ON metrics
  FOR SELECT USING (true);

CREATE POLICY "System can update metrics" ON metrics
  FOR UPDATE USING (true);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_charging_sessions_user_id ON charging_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_charging_sessions_station_id ON charging_sessions(station_id);
CREATE INDEX IF NOT EXISTS idx_charging_sessions_status ON charging_sessions(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- 7. Create functions for data integrity

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to track user sessions
CREATE OR REPLACE FUNCTION public.track_user_session()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_sessions (user_id, ip_address, user_agent)
  VALUES (auth.uid(), inet_client_addr(), current_setting('request.headers')::json->>'user-agent');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create views for analytics (read-only for authenticated users)
CREATE VIEW station_analytics AS
SELECT 
  s.id,
  s.name,
  s.location,
  s.status,
  COUNT(cs.id) as total_sessions,
  AVG(cs.energy_consumed) as avg_energy_consumed,
  SUM(cs.cost) as total_revenue,
  AVG(EXTRACT(EPOCH FROM (cs.end_time - cs.start_time))/3600) as avg_session_hours
FROM stations s
LEFT JOIN charging_sessions cs ON s.id = cs.station_id
GROUP BY s.id, s.name, s.location, s.status;

-- Grant access to analytics view
CREATE POLICY "Authenticated users can view analytics" ON station_analytics
  FOR SELECT USING (auth.role() = 'authenticated');

-- 9. Create function for session cleanup
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions 
  WHERE session_end IS NOT NULL 
  AND session_end < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 10. Create scheduled job for cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-sessions', '0 2 * * *', 'SELECT cleanup_old_sessions();');

-- Success message
SELECT 'Production security setup completed successfully!' as status; 