# Simple Environment Setup Script

Write-Host "🔧 ChargeSmart Environment Setup" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

Write-Host ""
Write-Host "Please enter your Supabase project details:" -ForegroundColor Yellow

# Get Supabase URL
$supabaseUrl = Read-Host "Enter your Supabase Project URL"

# Get Supabase Anon Key
$supabaseKey = Read-Host "Enter your Supabase Anon Key"

# Create .env.local file
$content = "VITE_SUPABASE_URL=$supabaseUrl`n"
$content += "VITE_SUPABASE_ANON_KEY=$supabaseKey`n"
$content += "VITE_APP_ENV=development`n"
$content += "VITE_REALTIME_ENABLED=true`n"
$content += "VITE_DEBUG_MODE=true`n"
$content += "VITE_SIMULATOR_ENABLED=true`n"

# Write to file
$content | Out-File -FilePath ".env.local" -Encoding ASCII

Write-Host ""
Write-Host "✅ Environment file created successfully!" -ForegroundColor Green
Write-Host "📁 File: .env.local" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run the database setup SQL in your Supabase dashboard"
Write-Host "2. Enable real-time extensions"
Write-Host "3. Test the application with: npm run dev" 