# ChargeSmart Environment Setup Script
# This script helps you set up your environment variables

Write-Host "🔧 ChargeSmart Environment Setup" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

Write-Host ""
Write-Host "Please enter your Supabase project details:" -ForegroundColor Yellow

# Get Supabase URL
$supabaseUrl = Read-Host "Enter your Supabase Project URL (e.g., https://your-project-id.supabase.co)"

# Get Supabase Anon Key
$supabaseKey = Read-Host "Enter your Supabase Anon Key (starts with eyJ...)"

# Validate inputs
if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "❌ Error: Both URL and Key are required!" -ForegroundColor Red
    exit 1
}

# Create .env.local file
$envContent = @"
# ChargeSmart Environment Variables
VITE_SUPABASE_URL=$supabaseUrl
VITE_SUPABASE_ANON_KEY=$supabaseKey
VITE_APP_ENV=development
VITE_REALTIME_ENABLED=true
VITE_DEBUG_MODE=true
VITE_SIMULATOR_ENABLED=true
"@

# Write to .env.local
$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host ""
Write-Host "✅ Environment file created successfully!" -ForegroundColor Green
Write-Host "📁 File: .env.local" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run the database setup SQL in your Supabase dashboard"
Write-Host "2. Enable real-time extensions"
Write-Host "3. Test the application with: npm run dev"
Write-Host ""
Write-Host "Database Setup Instructions:" -ForegroundColor Cyan
Write-Host "1. Go to your Supabase Dashboard"
Write-Host "2. Navigate to SQL Editor"
Write-Host "3. Copy and paste the contents of supabase/setup.sql"
Write-Host "4. Click 'Run' to execute the SQL"
Write-Host ""
Write-Host "Real-time Setup:" -ForegroundColor Cyan
Write-Host "1. Go to Settings > Database > Extensions"
Write-Host "2. Enable the 'realtime' extension"
Write-Host "3. Verify tables are added to realtime publication" 