# 🚀 ChargeSmart Quick Setup Guide

## Step 1: Create Supabase Project

1. **Go to [Supabase.com](https://supabase.com)** and sign up/login
2. **Create a new project**:
   - Click "New Project"
   - Choose your organization
   - Enter project name: `chargesmart-route-ai`
   - Set a secure database password
   - Choose a region close to India (e.g., Singapore)
   - Click "Create new project"

3. **Wait for project setup** (takes 1-2 minutes)

## Step 2: Get Your Project Credentials

1. **Go to Settings > API** in your Supabase dashboard
2. **Copy these values**:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

## Step 3: Create Environment File

Create a file named `.env.local` in your project root with:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6aG1jYnpra3lzdXB3bXV0dHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNjg0NDAsImV4cCI6MjA2Nzg0NDQ0MH0.zjftWiZgdFs3-Oq3LAd8T3_K4qzBEvjWB7aypAL4Zxs

# App Configuration
VITE_APP_ENV=development
VITE_REALTIME_ENABLED=true
VITE_DEBUG_MODE=true
VITE_SIMULATOR_ENABLED=true
```

**Replace the values with your actual Supabase credentials!**

## Step 4: Set Up Database

1. **Go to SQL Editor** in your Supabase dashboard
2. **Copy the entire contents** of `supabase/setup.sql`
3. **Paste and run** the SQL in the editor
4. **Verify success** - you should see "Database setup completed successfully!"

## Step 5: Enable Real-time Extensions

1. **Go to Settings > Database > Extensions**
2. **Enable the "realtime" extension**
3. **Verify tables are added** to realtime publication

## Step 6: Test the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Step 7: Test Real-time Features

1. **Navigate to the Live page** in your app
2. **Click "Start Simulator"** to begin generating test data
3. **Watch for real-time updates** in the UI
4. **Check browser console** for connection status

## Step 8: Verify Everything Works

You should see:
- ✅ Real-time station updates every 5 seconds
- ✅ Live alerts with toast notifications
- ✅ Connection status shows "Connected"
- ✅ Simulator controls work properly
- ✅ Data resets when you click "Reset Data"

## Troubleshooting

### Real-time Not Working?
1. Check Supabase real-time extension is enabled
2. Verify tables are added to realtime publication
3. Check environment variables are correct
4. Clear browser cache and reload

### Database Connection Errors?
1. Verify Supabase URL and API key
2. Check Row Level Security policies
3. Ensure tables exist in database
4. Check network connectivity

### Simulator Not Working?
1. Check browser console for errors
2. Verify RealTimeSimulator class is imported
3. Check if simulator instance is created
4. Ensure proper event handling

## Next Steps After Setup

1. **Deploy to Production**:
   ```powershell
   # Set environment variables
   $env:VITE_SUPABASE_URL="your-url"
   $env:VITE_SUPABASE_ANON_KEY="your-key"
   
   # Run deployment script
   .\deploy.ps1
   ```

2. **Connect Real Data Sources**:
   - Get API keys from OpenChargeMap, ChargePoint, or Tesla
   - Configure in environment variables
   - Test with real charging station data

3. **Set Up Monitoring**:
   - Configure error tracking (Sentry)
   - Set up performance monitoring
   - Enable analytics

## Support

- **Supabase Documentation**: https://supabase.com/docs
- **Real-time Guide**: `REAL_TIME_SETUP.md`
- **Testing Guide**: `TESTING_GUIDE.md`
- **Production Setup**: `PRODUCTION_SETUP.md`

---

**🎉 Once you complete these steps, your ChargeSmart Route AI will be fully functional with real-time capabilities!** 

---

## 🚨 Troubleshooting: No Live Stations, Only Fallback List

### 1. **Check Your OpenChargeMap API Key**
- Make sure your `.env.local` contains a valid `VITE_CHARGING_API_KEY`.
- You can get a free API key from [OpenChargeMap API registration](https://openchargemap.org/site/develop/api).
- Example in `.env.local`:
  ```
  VITE_CHARGING_API_URL=https://api.openchargemap.io/v3
  VITE_CHARGING_API_KEY=YOUR_VALID_API_KEY
  ```

### 2. **Check Network and CORS**
- Open your browser’s developer console (F12) and look for errors in the **Network** or **Console** tabs.
- If you see CORS errors or 401/403 errors, your API key may be missing, invalid, or restricted.

### 3. **Check Your Location**
- OpenChargeMap may not have stations in your immediate area.
- Try using a VPN or a location spoofer to simulate being in a major city (e.g., Mumbai, Delhi, Bangalore).
- You can use browser dev tools to override geolocation:
  - Chrome: DevTools > More Tools > Sensors > Geolocation > Select a city.

### 4. **Check API Response**
- In the browser console, run:
  ```js
  navigator.geolocation.getCurrentPosition(console.log, console.error)
  ```
  - This should print your coordinates.
- Then, try fetching stations manually:
  ```js
  fetch('https://api.openchargemap.io/v3/poi?key=YOUR_VALID_API_KEY&latitude=19.0760&longitude=72.8777&radius=10&maxresults=5')
    .then(r => r.json()).then(console.log)
  ```
  - Replace `YOUR_VALID_API_KEY` with your actual key.
  - If you get an empty array, there are no stations in that area.

### 5. **Check for API Limits**
- Free OpenChargeMap keys have rate limits. If you exceed them, you may get empty results or errors.

---

## 🟢 **What To Do Next**

1. **Get a valid OpenChargeMap API key** and add it to your `.env.local`.
2. **Restart your dev server** after changing `.env.local`:
   ```bash
   npm run dev
   ```
3. **Test with a location that has known stations** (e.g., Mumbai, Delhi, Bangalore).
4. **Check the browser console for errors** and share any error messages you see.

---

## 🛠️ **If You Need Help**

- **Share any error messages** from the browser console or network tab.
- **Let me know your test location** (city/coordinates).
- **Confirm your API key setup** (you can paste the relevant lines from `.env.local` with the key partially masked).

---

**Once you have a valid API key and test from a location with stations, you should see live results!**

Let me know what you find, and I can help you debug further if needed. 