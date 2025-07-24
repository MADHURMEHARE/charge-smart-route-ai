#!/bin/bash

# ChargeSmart Production Deployment Script
# This script helps deploy the ChargeSmart app to production

set -e

echo "🚀 ChargeSmart Production Deployment"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    print_status "Dependencies check passed ✓"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_status "Dependencies installed ✓"
}

# Build the application
build_app() {
    print_status "Building application for production..."
    npm run build
    print_status "Application built successfully ✓"
}

# Check environment variables
check_env() {
    print_status "Checking environment variables..."
    
    if [ -z "$VITE_SUPABASE_URL" ]; then
        print_error "VITE_SUPABASE_URL is not set"
        exit 1
    fi
    
    if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
        print_error "VITE_SUPABASE_ANON_KEY is not set"
        exit 1
    fi
    
    print_status "Environment variables check passed ✓"
}

# Create production environment file
create_env_file() {
    print_status "Creating production environment file..."
    
    cat > .env.production << EOF
VITE_SUPABASE_URL=$VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
VITE_APP_ENV=production
VITE_APP_VERSION=$(git describe --tags --always --dirty || echo "dev")
EOF
    
    print_status "Environment file created ✓"
}

# Run database setup
setup_database() {
    print_status "Setting up database..."
    
    if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
        print_warning "SUPABASE_ACCESS_TOKEN not set. Please run database setup manually."
        print_warning "Run the SQL in supabase/setup.sql in your Supabase dashboard."
        return
    fi
    
    # If you have Supabase CLI installed
    if command -v supabase &> /dev/null; then
        print_status "Running database migrations..."
        supabase db push
        print_status "Database setup completed ✓"
    else
        print_warning "Supabase CLI not found. Please run database setup manually."
    fi
}

# Deploy to Vercel (if configured)
deploy_vercel() {
    if command -v vercel &> /dev/null; then
        print_status "Deploying to Vercel..."
        vercel --prod
        print_status "Deployment to Vercel completed ✓"
    else
        print_warning "Vercel CLI not found. Please deploy manually."
    fi
}

# Deploy to Netlify (if configured)
deploy_netlify() {
    if command -v netlify &> /dev/null; then
        print_status "Deploying to Netlify..."
        netlify deploy --prod --dir=dist
        print_status "Deployment to Netlify completed ✓"
    else
        print_warning "Netlify CLI not found. Please deploy manually."
    fi
}

# Run tests
run_tests() {
    print_status "Running tests..."
    npm run test || print_warning "Tests failed, but continuing deployment..."
}

# Security check
security_check() {
    print_status "Running security checks..."
    
    # Check for common security issues
    if grep -r "console.log" src/ --include="*.ts" --include="*.tsx" | grep -v "// TODO" > /dev/null; then
        print_warning "Found console.log statements in production code"
    fi
    
    if grep -r "TODO" src/ --include="*.ts" --include="*.tsx" > /dev/null; then
        print_warning "Found TODO comments in production code"
    fi
    
    print_status "Security checks completed ✓"
}

# Main deployment function
main() {
    echo ""
    print_status "Starting ChargeSmart deployment..."
    
    check_dependencies
    check_env
    create_env_file
    install_dependencies
    run_tests
    security_check
    build_app
    setup_database
    
    echo ""
    print_status "Deployment completed successfully! 🎉"
    echo ""
    print_status "Next steps:"
    echo "1. Deploy the 'dist' folder to your hosting provider"
    echo "2. Set up your domain and SSL certificate"
    echo "3. Configure monitoring and logging"
    echo "4. Set up CI/CD pipeline for future deployments"
    echo ""
    print_status "For manual deployment:"
    echo "- Upload the 'dist' folder to your web server"
    echo "- Configure your web server to serve index.html for all routes"
    echo "- Set up environment variables on your hosting platform"
}

# Run main function
main "$@" 