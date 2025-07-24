# ChargeSmart Production Setup Guide

## 🚀 Production Deployment Checklist

### 1. Environment Variables Setup

Create a `.env.production` file with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# App Configuration
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=ChargeSmart Route AI

# Real-time Configuration
VITE_REALTIME_ENABLED=true
VITE_REALTIME_UPDATE_INTERVAL=5000

# External API Configuration (for real charging station data)
VITE_CHARGING_API_URL=https://api.openchargemap.io/v3
VITE_CHARGING_API_KEY=your-api-key-here

# Analytics Configuration
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_ID=your-analytics-id

# Monitoring Configuration
VITE_MONITORING_ENABLED=true
VITE_SENTRY_DSN=your-sentry-dsn

# Feature Flags
VITE_FEATURE_REAL_TIME=true
VITE_FEATURE_LOCATION_SERVICES=true
VITE_FEATURE_CHARGING_SESSIONS=true
VITE_FEATURE_ANALYTICS=true

# Security Configuration
VITE_CSP_NONCE=your-csp-nonce
VITE_HSTS_ENABLED=true

# Performance Configuration
VITE_CACHE_ENABLED=true
VITE_CACHE_DURATION=3600
VITE_PAGINATION_LIMIT=50

# Development/Testing (set to false in production)
VITE_DEBUG_MODE=false
VITE_SIMULATOR_ENABLED=false
```

### 2. Database Setup

#### 2.1 Run Initial Setup
```sql
-- Run the SQL from supabase/setup.sql in your Supabase SQL Editor
-- This creates all tables, indexes, and initial data
```

#### 2.2 Enable Real-time Extensions
1. Go to your Supabase Dashboard
2. Navigate to Settings > Database > Extensions
3. Enable the "realtime" extension
4. Verify tables are added to realtime publication

#### 2.3 Set Up Production Security
```sql
-- Run the SQL from supabase/production-security.sql
-- This sets up proper authentication and authorization
```

### 3. Authentication Setup

#### 3.1 Configure Supabase Auth
1. Go to Authentication > Settings in Supabase Dashboard
2. Configure your site URL
3. Set up email templates
4. Configure OAuth providers if needed

#### 3.2 Set Up User Management
```sql
-- Create admin users
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES ('admin@chargesmart.com', crypt('secure-password', gen_salt('bf')), now(), now(), now());
```

### 4. External API Integration

#### 4.1 Charging Station APIs
- **OpenChargeMap**: Free API for global charging stations
- **ChargePoint**: Commercial API for US stations
- **Tesla Supercharger**: Tesla's network data
- **Custom APIs**: Your own charging station network

#### 4.2 API Configuration
```javascript
// Example API integration
const apiConfig = {
  openChargeMap: {
    url: 'https://api.openchargemap.io/v3',
    key: process.env.VITE_CHARGING_API_KEY
  },
  chargePoint: {
    url: 'https://api.chargepoint.com/v1',
    key: process.env.VITE_CHARGEPOINT_API_KEY
  }
};
```

### 5. Deployment Options

#### 5.1 Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

#### 5.2 Netlify Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

#### 5.3 AWS S3 + CloudFront
```bash
# Build the app
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name

# Configure CloudFront for CDN
```

#### 5.4 Docker Deployment
```dockerfile
# Dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 6. Security Configuration

#### 6.1 Content Security Policy
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' 'unsafe-eval' https://your-project.supabase.co;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://your-project.supabase.co wss://your-project.supabase.co;">
```

#### 6.2 HTTPS Configuration
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

### 7. Monitoring and Analytics

#### 7.1 Error Tracking
```javascript
// Sentry configuration
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  tracesSampleRate: 1.0,
});
```

#### 7.2 Performance Monitoring
```javascript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### 8. Performance Optimization

#### 8.1 Code Splitting
```javascript
// Lazy load components
const Live = lazy(() => import('./pages/Live'));
const Analytics = lazy(() => import('./pages/Analytics'));
```

#### 8.2 Caching Strategy
```javascript
// Service Worker for caching
const CACHE_NAME = 'chargesmart-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
];
```

#### 8.3 Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX CONCURRENTLY idx_stations_location_status 
ON stations(location, status);

CREATE INDEX CONCURRENTLY idx_alerts_time_type 
ON alerts(time, type);
```

### 9. Backup and Recovery

#### 9.1 Database Backups
```bash
# Automated backup script
#!/bin/bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### 9.2 Disaster Recovery
1. Set up automated backups
2. Test restore procedures
3. Document recovery steps
4. Set up monitoring alerts

### 10. Scaling Considerations

#### 10.1 Database Scaling
- Use read replicas for analytics
- Implement connection pooling
- Consider database sharding for large datasets

#### 10.2 Application Scaling
- Use CDN for static assets
- Implement caching layers
- Consider microservices architecture

#### 10.3 Real-time Scaling
- Use Redis for pub/sub
- Implement WebSocket clustering
- Consider using Supabase's real-time features

### 11. Testing in Production

#### 11.1 Smoke Tests
```bash
# Basic functionality tests
curl -f https://your-domain.com/api/health
curl -f https://your-domain.com/api/stations
```

#### 11.2 Load Testing
```bash
# Use artillery for load testing
artillery run load-test.yml
```

#### 11.3 Monitoring Alerts
- Set up uptime monitoring
- Configure error rate alerts
- Monitor performance metrics

### 12. Maintenance Procedures

#### 12.1 Regular Maintenance
- Update dependencies monthly
- Review security patches
- Monitor performance metrics
- Clean up old data

#### 12.2 Update Procedures
1. Test updates in staging
2. Deploy during low-traffic periods
3. Monitor for issues
4. Have rollback plan ready

### 13. Compliance and Legal

#### 13.1 Data Protection
- Implement GDPR compliance
- Set up data retention policies
- Configure user consent management

#### 13.2 Privacy Policy
- Create comprehensive privacy policy
- Implement cookie consent
- Set up data export/deletion procedures

### 14. Support and Documentation

#### 14.1 User Documentation
- Create user guides
- Set up help center
- Provide contact information

#### 14.2 Technical Documentation
- API documentation
- Deployment procedures
- Troubleshooting guides

## 🎯 Quick Start Checklist

- [ ] Set up Supabase project
- [ ] Configure environment variables
- [ ] Run database setup scripts
- [ ] Enable real-time extensions
- [ ] Set up authentication
- [ ] Configure external APIs
- [ ] Deploy to hosting platform
- [ ] Set up monitoring
- [ ] Test all functionality
- [ ] Configure backups
- [ ] Set up SSL certificate
- [ ] Create documentation

## 📞 Support Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Vite Documentation**: https://vitejs.dev/guide/
- **React Documentation**: https://react.dev/
- **Real-time Best Practices**: https://supabase.com/docs/guides/realtime

## 🚨 Emergency Contacts

- **Database Issues**: Check Supabase status page
- **Deployment Issues**: Review hosting provider status
- **Security Issues**: Contact security team immediately
- **Performance Issues**: Check monitoring dashboards 