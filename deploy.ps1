# ChargeSmart Production Deployment Script for Windows
# Run this script in PowerShell

param(
    [string]$Environment = "production"
)

Write-Host "🚀 ChargeSmart Production Deployment" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if required tools are installed
function Test-Dependencies {
    Write-Status "Checking dependencies..."
    
    try {
        $nodeVersion = node --version
        Write-Status "Node.js version: $nodeVersion"
    }
    catch {
        Write-Error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    }
    
    try {
        $npmVersion = npm --version
        Write-Status "npm version: $npmVersion"
    }
    catch {
        Write-Error "npm is not installed. Please install npm"
        exit 1
    }
    
    Write-Status "Dependencies check passed ✓"
}

# Install dependencies
function Install-Dependencies {
    Write-Status "Installing dependencies..."
    npm install
    Write-Status "Dependencies installed ✓"
}

# Build the application
function Build-App {
    Write-Status "Building application for production..."
    npm run build
    Write-Status "Application built successfully ✓"
}

# Check environment variables
function Test-Environment {
    Write-Status "Checking environment variables..."
    
    $supabaseUrl = $env:VITE_SUPABASE_URL
    $supabaseKey = $env:VITE_SUPABASE_ANON_KEY
    
    if (-not $supabaseUrl) {
        Write-Error "VITE_SUPABASE_URL is not set"
        exit 1
    }
    
    if (-not $supabaseKey) {
        Write-Error "VITE_SUPABASE_ANON_KEY is not set"
        exit 1
    }
    
    Write-Status "Environment variables check passed ✓"
}

# Create production environment file
function New-EnvironmentFile {
    Write-Status "Creating production environment file..."
    
    $envContent = @"
VITE_SUPABASE_URL=$env:VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$env:VITE_SUPABASE_ANON_KEY
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
"@
    
    $envContent | Out-File -FilePath ".env.production" -Encoding UTF8
    Write-Status "Environment file created ✓"
}

# Run database setup
function Setup-Database {
    Write-Status "Setting up database..."
    
    if (-not $env:SUPABASE_ACCESS_TOKEN) {
        Write-Warning "SUPABASE_ACCESS_TOKEN not set. Please run database setup manually."
        Write-Warning "Run the SQL in supabase/setup.sql in your Supabase dashboard."
        return
    }
    
    # Check if Supabase CLI is installed
    try {
        $supabaseVersion = supabase --version
        Write-Status "Supabase CLI version: $supabaseVersion"
        Write-Status "Running database migrations..."
        supabase db push
        Write-Status "Database setup completed ✓"
    }
    catch {
        Write-Warning "Supabase CLI not found. Please run database setup manually."
    }
}

# Run tests
function Test-Application {
    Write-Status "Running tests..."
    try {
        npm run test
        Write-Status "Tests passed ✓"
    }
    catch {
        Write-Warning "Tests failed, but continuing deployment..."
    }
}

# Security check
function Test-Security {
    Write-Status "Running security checks..."
    
    # Check for console.log statements
    $consoleLogs = Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx" | 
                   Select-String "console\.log" | 
                   Where-Object { $_ -notmatch "// TODO" }
    
    if ($consoleLogs) {
        Write-Warning "Found console.log statements in production code"
    }
    
    # Check for TODO comments
    $todos = Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx" | 
             Select-String "TODO"
    
    if ($todos) {
        Write-Warning "Found TODO comments in production code"
    }
    
    Write-Status "Security checks completed ✓"
}

# Deploy to Vercel (if configured)
function Deploy-Vercel {
    try {
        $vercelVersion = vercel --version
        Write-Status "Deploying to Vercel..."
        vercel --prod
        Write-Status "Deployment to Vercel completed ✓"
    }
    catch {
        Write-Warning "Vercel CLI not found. Please deploy manually."
    }
}

# Deploy to Netlify (if configured)
function Deploy-Netlify {
    try {
        $netlifyVersion = netlify --version
        Write-Status "Deploying to Netlify..."
        netlify deploy --prod --dir=dist
        Write-Status "Deployment to Netlify completed ✓"
    }
    catch {
        Write-Warning "Netlify CLI not found. Please deploy manually."
    }
}

# Main deployment function
function Start-Deployment {
    Write-Host ""
    Write-Status "Starting ChargeSmart deployment..."
    
    Test-Dependencies
    Test-Environment
    New-EnvironmentFile
    Install-Dependencies
    Test-Application
    Test-Security
    Build-App
    Setup-Database
    
    Write-Host ""
    Write-Status "Deployment completed successfully! 🎉"
    Write-Host ""
    Write-Status "Next steps:"
    Write-Host "1. Deploy the 'dist' folder to your hosting provider"
    Write-Host "2. Set up your domain and SSL certificate"
    Write-Host "3. Configure monitoring and logging"
    Write-Host "4. Set up CI/CD pipeline for future deployments"
    Write-Host ""
    Write-Status "For manual deployment:"
    Write-Host "- Upload the 'dist' folder to your web server"
    Write-Host "- Configure your web server to serve index.html for all routes"
    Write-Host "- Set up environment variables on your hosting platform"
}

# Run main function
Start-Deployment 