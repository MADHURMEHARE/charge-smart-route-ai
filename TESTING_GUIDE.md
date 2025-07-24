# ChargeSmart Testing Guide

## 🧪 Testing Real-Time Features

### Prerequisites
1. Supabase project set up with database tables
2. Environment variables configured
3. Real-time extensions enabled

### Step 1: Database Setup Testing

#### 1.1 Run Database Setup
```bash
# Copy the SQL from supabase/setup.sql and run in Supabase SQL Editor
# Or use Supabase CLI if you have it installed
supabase db push
```

#### 1.2 Verify Tables Created
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('stations', 'alerts', 'metrics');
```

#### 1.3 Verify Real-time Enabled
```sql
-- Check if tables are in realtime publication
SELECT schemaname, tablename FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

### Step 2: Real-Time Simulator Testing

#### 2.1 Start the Development Server
```bash
npm run dev
```

#### 2.2 Test Simulator Controls
1. Navigate to the Live page
2. Click "Start Simulator" to begin generating test data
3. Watch for real-time updates in the UI
4. Check browser console for connection status
5. Click "Stop Simulator" to halt data generation
6. Click "Reset Data" to clear all test data

#### 2.3 Verify Real-Time Updates
- Station status should update every 5 seconds
- New alerts should appear with toast notifications
- Metrics should update in real-time
- Connection status should show "Connected"

### Step 3: API Integration Testing

#### 3.1 Test Real Data Sources
```javascript
// In browser console, test the API
import { chargingStationAPI } from './src/services/chargingStationAPI';

// Test nearby stations (requires location permission)
chargingStationAPI.getNearbyStations()
  .then(stations => console.log('Nearby stations:', stations))
  .catch(error => console.error('Error:', error));

// Test station status update
chargingStationAPI.updateStationStatus(1, 'maintenance')
  .then(() => console.log('Status updated'))
  .catch(error => console.error('Error:', error));
```

#### 3.2 Test Charging Sessions
```javascript
// Start a charging session
chargingStationAPI.startChargingSession(1, 'user-id')
  .then(sessionId => {
    console.log('Session started:', sessionId);
    
    // End the session after some time
    setTimeout(() => {
      chargingStationAPI.endChargingSession(sessionId, 25.5, 15.30)
        .then(() => console.log('Session ended'))
        .catch(error => console.error('Error:', error));
    }, 5000);
  })
  .catch(error => console.error('Error:', error));
```

### Step 4: Production Security Testing

#### 4.1 Test Authentication
1. Set up Supabase authentication
2. Test user registration and login
3. Verify user profiles are created automatically
4. Test session tracking

#### 4.2 Test Row Level Security
```sql
-- Test as anonymous user
SELECT * FROM stations LIMIT 5;

-- Test as authenticated user
-- (This requires setting up auth in your app)
```

#### 4.3 Test API Rate Limiting
```bash
# Test with curl
curl -X GET "https://your-project.supabase.co/rest/v1/stations" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Step 5: Performance Testing

#### 5.1 Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Create a test scenario
cat > load-test.yml << EOF
config:
  target: 'http://localhost:5173'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Real-time page load"
    flow:
      - get:
          url: "/live"
      - think: 5
      - get:
          url: "/stations"
EOF

# Run load test
artillery run load-test.yml
```

#### 5.2 Memory Usage Testing
```bash
# Monitor memory usage during real-time operations
# Use browser dev tools Performance tab
# Look for memory leaks in WebSocket connections
```

### Step 6: Error Handling Testing

#### 6.1 Test Network Disconnection
1. Open browser dev tools
2. Go to Network tab
3. Set network to "Offline"
4. Verify error handling and reconnection logic

#### 6.2 Test Invalid Data
```javascript
// Test with invalid station data
const invalidStation = {
  id: 999,
  name: '',
  status: 'invalid_status'
};

// This should be handled gracefully
```

### Step 7: Browser Compatibility Testing

#### 7.1 Test Different Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

#### 7.2 Test Mobile Devices
- iOS Safari
- Android Chrome
- Test responsive design
- Test touch interactions

### Step 8: Production Deployment Testing

#### 8.1 Build Testing
```bash
# Test production build
npm run build

# Verify build output
ls -la dist/

# Test build locally
npm run preview
```

#### 8.2 Environment Variables Testing
```bash
# Test environment variable loading
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test with different environments
NODE_ENV=production npm run build
```

#### 8.3 Deployment Testing
```bash
# Test deployment script
chmod +x deploy.sh
./deploy.sh

# Or test manual deployment
npm run build
# Upload dist/ folder to your hosting provider
```

## 🐛 Common Issues and Solutions

### Issue 1: Real-time Not Working
**Symptoms:** No live updates, connection status shows "Disconnected"

**Solutions:**
1. Check Supabase real-time extension is enabled
2. Verify tables are added to realtime publication
3. Check environment variables
4. Clear browser cache and reload

### Issue 2: Database Connection Errors
**Symptoms:** Console errors about database connection

**Solutions:**
1. Verify Supabase URL and API key
2. Check Row Level Security policies
3. Ensure tables exist in database
4. Check network connectivity

### Issue 3: Simulator Not Working
**Symptoms:** Simulator controls don't respond

**Solutions:**
1. Check browser console for errors
2. Verify RealTimeSimulator class is imported
3. Check if simulator instance is created
4. Ensure proper event handling

### Issue 4: Performance Issues
**Symptoms:** Slow updates, high memory usage

**Solutions:**
1. Reduce update frequency
2. Implement data pagination
3. Add connection pooling
4. Optimize database queries

## 📊 Testing Checklist

### Database Setup
- [ ] Tables created successfully
- [ ] Real-time enabled
- [ ] Initial data inserted
- [ ] Indexes created
- [ ] RLS policies configured

### Real-Time Features
- [ ] Simulator starts/stops correctly
- [ ] Live updates appear in UI
- [ ] Toast notifications work
- [ ] Connection status accurate
- [ ] Data resets properly

### API Integration
- [ ] Real station data fetches
- [ ] Location services work
- [ ] Charging sessions track
- [ ] Analytics calculate correctly
- [ ] Error handling works

### Security
- [ ] Authentication works
- [ ] RLS policies enforced
- [ ] API keys secure
- [ ] User data protected
- [ ] Session management works

### Performance
- [ ] Page loads quickly
- [ ] Real-time updates smooth
- [ ] Memory usage stable
- [ ] Network requests optimized
- [ ] Mobile performance good

### Production Ready
- [ ] Build succeeds
- [ ] Environment variables set
- [ ] Deployment script works
- [ ] SSL certificate configured
- [ ] Monitoring set up

## 🚀 Next Steps After Testing

1. **Deploy to Production**
   - Use the deployment script
   - Set up CI/CD pipeline
   - Configure monitoring

2. **Connect Real Data Sources**
   - Integrate with actual charging station APIs
   - Set up data synchronization
   - Implement real-time monitoring

3. **Scale the Application**
   - Add more stations
   - Implement caching
   - Optimize database queries

4. **Add Advanced Features**
   - User authentication
   - Payment processing
   - Advanced analytics
   - Mobile app

## 📞 Support

If you encounter issues during testing:

1. Check the browser console for errors
2. Verify Supabase dashboard settings
3. Test with different browsers
4. Check network connectivity
5. Review the REAL_TIME_SETUP.md guide

For production issues, ensure you have:
- Proper error logging
- Monitoring and alerting
- Backup and recovery procedures
- Support documentation 