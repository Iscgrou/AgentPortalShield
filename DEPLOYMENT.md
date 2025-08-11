# MarFaNet Production Deployment Guide

## 🎯 Deployment Overview

This document provides comprehensive deployment instructions for MarFaNet Financial Management System across different environments, with special focus on production-grade configurations.

## 🏗️ Architecture Requirements

### System Requirements
```yaml
Minimum Specifications:
  CPU: 1 vCPU (2+ recommended)
  RAM: 512MB (1GB+ recommended)
  Storage: 2GB (5GB+ recommended)
  Node.js: v18+ (v20 LTS recommended)
  PostgreSQL: v14+ (v15+ recommended)

Network Requirements:
  Inbound: HTTP/HTTPS (80/443)
  Outbound: HTTPS (443) for API calls
  Database: PostgreSQL port (5432 or custom)
```

### Environment Dependencies
```yaml
Required Services:
  - PostgreSQL Database (Neon serverless recommended)
  - Google Gemini AI API (for financial analysis)
  - Telegram Bot API (optional, for notifications)

Optional Services:
  - Redis (for session store scaling)
  - Load Balancer (for high availability)
  - CDN (for static asset delivery)
```

## 🚀 Production Deployment Methods

### Method 1: Replit Deployment (Recommended)

#### Step 1: Environment Setup
```bash
# Required environment variables in Replit
export DATABASE_URL="postgresql://username:password@host:5432/database"
export GEMINI_API_KEY="your-gemini-api-key"
export SESSION_SECRET="generate-secure-random-string"
export NODE_ENV="production"

# Optional Telegram integration
export TELEGRAM_BOT_TOKEN="your-bot-token"
export TELEGRAM_CHAT_ID="your-chat-id"
```

#### Step 2: Database Configuration
```sql
-- Ensure your PostgreSQL database has these extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify connection pooling (for Neon)
SET statement_timeout = '30s';
SET idle_in_transaction_session_timeout = '60s';
```

#### Step 3: Build & Deploy
```bash
# Install dependencies
npm install --production

# Build application
npm run build

# Start production server
npm start
```

#### Step 4: Health Check
```bash
# Verify deployment
curl https://your-app.replit.app/health
curl https://your-app.replit.app/ready

# Test admin access
curl -I https://your-app.replit.app/
# Should redirect to admin login

# Test portal access (replace with actual publicId)
curl -I https://your-app.replit.app/portal/sample-public-id
```

### Method 2: Traditional VPS/Cloud Deployment

#### Step 1: Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx (optional, for reverse proxy)
sudo apt install nginx -y
```

#### Step 2: Application Setup
```bash
# Create application directory
sudo mkdir -p /var/www/marfanet
cd /var/www/marfanet

# Clone repository
git clone <your-repo-url> .

# Install dependencies
npm install --production

# Build application
npm run build

# Set correct permissions
sudo chown -R $USER:$USER /var/www/marfanet
```

#### Step 3: Environment Configuration
```bash
# Create production environment file
cat > .env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/marfanet
GEMINI_API_KEY=your-gemini-key
SESSION_SECRET=$(openssl rand -base64 32)
TELEGRAM_BOT_TOKEN=your-telegram-token
TELEGRAM_CHAT_ID=your-chat-id
EOF

# Secure environment file
chmod 600 .env
```

#### Step 4: Process Management with PM2
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'marfanet',
    script: 'dist/server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
# Follow the generated command to enable auto-start
```

#### Step 5: Nginx Reverse Proxy (Optional)
```bash
# Create Nginx configuration
sudo cat > /etc/nginx/sites-available/marfanet << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Special handling for portal routes
    location /portal/ {
        add_header X-Frame-Options "ALLOWALL" always;
        add_header Cache-Control "public, max-age=300" always;
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static files and SPA routing
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Health checks
    location /health {
        proxy_pass http://localhost:5000;
        access_log off;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/marfanet /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Method 3: Docker Deployment

#### Step 1: Create Dockerfile
```dockerfile
# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 5000

ENV NODE_ENV production
ENV PORT 5000

CMD ["node", "dist/server/index.js"]
EOF
```

#### Step 2: Docker Compose Setup
```yaml
# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  marfanet:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - DATABASE_URL=${DATABASE_URL}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - SESSION_SECRET=${SESSION_SECRET}
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Optional: Local PostgreSQL (if not using external service)
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=marfanet
      - POSTGRES_USER=marfanet
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
EOF
```

#### Step 3: Deploy with Docker
```bash
# Build and start services
docker-compose up -d --build

# View logs
docker-compose logs -f marfanet

# Health check
curl http://localhost:5000/health
```

## 🔒 Security Configuration

### SSL/TLS Setup (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal check
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall Configuration
```bash
# UFW firewall setup
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 5000  # Only if direct access needed
sudo ufw status
```

### Security Headers
```nginx
# Add to Nginx configuration
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' *" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## 📊 Monitoring & Maintenance

### Health Monitoring Setup
```bash
# Create monitoring script
cat > /usr/local/bin/marfanet-health.sh << 'EOF'
#!/bin/bash
HEALTH_URL="http://localhost:5000/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "$(date): MarFaNet is healthy"
else
    echo "$(date): MarFaNet health check failed with code $RESPONSE"
    # Restart service if needed
    pm2 restart marfanet
fi
EOF

chmod +x /usr/local/bin/marfanet-health.sh

# Add to crontab for regular health checks
echo "*/5 * * * * /usr/local/bin/marfanet-health.sh >> /var/log/marfanet-health.log" | crontab -
```

### Log Management
```bash
# Setup log rotation
sudo cat > /etc/logrotate.d/marfanet << EOF
/var/www/marfanet/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    postrotate
        pm2 reload marfanet
    endscript
}
EOF

# PM2 log management
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 🔧 Performance Optimization

### Database Optimization
```sql
-- PostgreSQL performance tuning
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Reload configuration
SELECT pg_reload_conf();

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_representative_created 
ON invoices(representative_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_representative_date 
ON payments(representative_id, payment_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_representatives_public_id 
ON representatives(public_id);
```

### Node.js Optimization
```bash
# PM2 configuration for production
pm2 start ecosystem.config.js --env production

# Memory and CPU monitoring
pm2 monit

# Performance monitoring
pm2 install pm2-server-monit
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### Database Connection Problems
```bash
# Test database connectivity
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('DB Error:', err);
  else console.log('DB Connected:', res.rows[0]);
  process.exit(0);
});
"
```

#### Portal Access Issues
```bash
# Check security headers
curl -I https://yourdomain.com/portal/test-id

# Verify Android compatibility
curl -H "User-Agent: Mozilla/5.0 (Linux; Android 10)" \
     -I https://yourdomain.com/portal/test-id
```

#### Performance Issues
```bash
# Monitor application performance
pm2 monit

# Check system resources
htop
iostat -x 1
free -m

# Application logs
pm2 logs marfanet --lines 100
```

### Recovery Procedures

#### Application Recovery
```bash
# Restart application
pm2 restart marfanet

# Reload application (zero downtime)
pm2 reload marfanet

# Emergency stop and start
pm2 stop marfanet
pm2 start marfanet
```

#### Database Recovery
```bash
# Create database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < backup_file.sql
```

## 📋 Post-Deployment Checklist

### Immediate Verification
- [ ] Application starts without errors
- [ ] Health endpoints respond correctly (`/health`, `/ready`)
- [ ] Admin login works (mgr/8679)
- [ ] Database connectivity confirmed
- [ ] Environment variables loaded correctly

### Functional Testing
- [ ] Admin panel accessible and functional
- [ ] Representative portal accessible via publicId
- [ ] JSON file upload and processing works
- [ ] AI assistant responds (if Gemini API configured)
- [ ] Telegram integration functional (if configured)

### Security Verification
- [ ] SSL certificate installed and working
- [ ] Security headers properly configured
- [ ] Admin routes require authentication
- [ ] Portal routes accessible without authentication
- [ ] No sensitive data exposed in error messages

### Performance Testing
- [ ] Application responds within acceptable timeframe
- [ ] Large JSON file processing completes successfully
- [ ] Mobile browser compatibility verified (Android/iOS)
- [ ] Database queries perform efficiently

### Monitoring Setup
- [ ] Health monitoring script configured
- [ ] Log rotation configured
- [ ] Process monitoring active (PM2)
- [ ] Backup procedures implemented
- [ ] Alert notifications configured

---

**Deployment Status**: ✅ Production Ready  
**Supported Platforms**: Replit, VPS, Docker, Cloud Providers  
**Architecture**: Scalable, Secure, Mobile-Optimized  
**Maintenance**: Automated monitoring and recovery procedures