# Real-Time Setup Guide for ChargeSmart

This guide explains how to make your ChargeSmart app work in real-time with live data updates, notifications, and WebSocket connections.

## 🚀 What's Implemented

### ✅ Real-Time Features
- **Live Station Monitoring** - Real-time updates of charging station status
- **Instant Notifications** - Toast alerts for station changes and system events
- **Live Metrics** - Real-time dashboard metrics updates
- **Connection Status** - Visual indicators for WebSocket connection
- **Data Simulator** - Test data generator for development

### ✅ Technologies Used
- **Supabase Real-time** - WebSocket connections for live data
- **React Query** - Data fetching and caching
- **Toast Notifications** - User feedback for real-time events
- **TypeScript** - Type-safe real-time data handling

## 📋 Setup Instructions

### 1. Database Setup (Supabase)

First, create the required tables in your Supabase database:

```sql
-- Create stations table
CREATE TABLE stations (
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

-- Create alerts table
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  type VARCHAR CHECK (type IN ('warning', 'info', 'success', 'error')) NOT NULL,
  message VARCHAR NOT NULL,
  time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location VARCHAR NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create metrics table
CREATE TABLE metrics (
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

-- Enable Row Level Security (RLS)
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (for demo)
CREATE POLICY "Allow anonymous read access" ON stations FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON alerts FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON metrics FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON stations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON stations FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous insert access" ON alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON alerts FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous insert access" ON metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON metrics FOR UPDATE USING (true);

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE stations;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE metrics;
```

### 2. Environment Variables

Make sure your Supabase configuration is correct in `src/integrations/supabase/client.ts`:

```typescript
const SUPABASE_URL = "your-supabase-url";
const SUPABASE_PUBLISHABLE_KEY = "your-supabase-anon-key";
```

### 3. Install Dependencies

The required dependencies are already in your `package.json`:
- `@supabase/supabase-js` - Supabase client
- `@tanstack/react-query` - Data fetching
- `react-router-dom` - Navigation

## 🔧 How It Works

### Real-Time Data Flow

1. **WebSocket Connection**: Supabase establishes WebSocket connections
2. **Database Changes**: Changes in Supabase trigger real-time events
3. **Client Updates**: React components receive live updates
4. **UI Updates**: Components re-render with new data
5. **Notifications**: Toast notifications for important events

### Key Components

#### `useRealTime` Hook
```typescript
const { stations, alerts, metrics, isConnected, dismissAlert } = useRealTime();
```

**Features:**
- Real-time subscriptions to database changes
- Connection status monitoring
- Automatic data loading
- Toast notifications for updates

#### Real-Time Simulator
```typescript
import { realTimeSimulator } from '@/utils/realTimeSimulator';
realTimeSimulator.start(); // Start generating test data
```

**Features:**
- Generates realistic station updates
- Creates random alerts
- Updates metrics periodically
- Simulates real-world scenarios

## 🎯 Testing Real-Time Features

### 1. Start the Simulator
1. Navigate to the **Live** page
2. Use the **Real-time Controls** panel (bottom-right)
3. Click **Start** to begin generating test data

### 2. Watch Live Updates
- **Stations**: Status, availability, and power changes
- **Alerts**: New notifications appear as toasts
- **Metrics**: Dashboard numbers update in real-time
- **Connection**: Visual indicator shows connection status

### 3. Test Scenarios
- **Station Status Changes**: Watch stations go offline/maintenance
- **Availability Updates**: See available ports change
- **Alert Generation**: New alerts appear every 30 seconds
- **Connection Loss**: Disconnect internet to test reconnection

## 🚨 Production Considerations

### 1. Security
```sql
-- Implement proper RLS policies for production
CREATE POLICY "Users can only see their own data" ON stations
FOR SELECT USING (auth.uid() = user_id);
```

### 2. Performance
- **Connection Limits**: Monitor WebSocket connections
- **Data Volume**: Implement pagination for large datasets
- **Caching**: Use React Query for efficient data caching

### 3. Monitoring
- **Connection Status**: Monitor WebSocket health
- **Error Handling**: Implement retry logic
- **Logging**: Track real-time events

## 🔄 Real-Time Features Explained

### Station Updates
- **Status Changes**: Active → Maintenance → Offline
- **Availability**: Available ports change in real-time
- **Power Usage**: Current power consumption updates
- **Efficiency**: Calculated based on utilization

### Alert System
- **Types**: Warning, Info, Success, Error
- **Dismissal**: Users can dismiss alerts
- **Persistence**: Alerts stored in database
- **Real-time**: New alerts appear instantly

### Metrics Dashboard
- **Active Sessions**: Live count of charging sessions
- **Total Power**: Network-wide power consumption
- **Network Uptime**: System availability percentage
- **Response Time**: Average API response time

## 🛠️ Customization

### Adding New Real-Time Features

1. **Create Database Table**:
```sql
CREATE TABLE your_table (
  id SERIAL PRIMARY KEY,
  -- your columns
);
```

2. **Update Types**:
```typescript
// In src/integrations/supabase/types.ts
your_table: {
  Row: { /* your types */ },
  Insert: { /* your types */ },
  Update: { /* your types */ }
}
```

3. **Add to useRealTime Hook**:
```typescript
// In src/hooks/useRealTime.ts
const yourSubscription = supabase
  .channel('your_table')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'your_table' },
    (payload) => handleYourUpdate(payload)
  )
  .subscribe();
```

### Custom Notifications
```typescript
// In your component
import { toast } from '@/hooks/use-toast';

toast({
  title: "Custom Event",
  description: "Your real-time update",
  variant: "default",
});
```

## 🎉 Next Steps

1. **Deploy to Production**: Set up Supabase production database
2. **Add Authentication**: Implement user login/signup
3. **Real Data Sources**: Connect to actual charging station APIs
4. **Advanced Features**: Add maps, routing, payment integration
5. **Mobile App**: Create React Native version

## 📞 Support

For issues with real-time functionality:
1. Check Supabase dashboard for connection status
2. Verify database tables and policies
3. Check browser console for WebSocket errors
4. Ensure environment variables are correct

---

**Your ChargeSmart app now has full real-time capabilities! 🚀** 