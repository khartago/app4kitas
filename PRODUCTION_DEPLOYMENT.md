# 🚀 Production Deployment Guide - App4KITAs

## 📋 Overview

This guide provides comprehensive instructions for deploying App4KITAs to production. The platform is **backend-ready** with 427 passing tests, while the frontend requires testing implementation before full production deployment.

## 🎯 Deployment Status

### ✅ **Backend (Production Ready)**
- **Status**: 100% ready for production
- **Tests**: 427/427 passing
- **Security**: Enterprise-level implemented
- **GDPR Compliance**: 100% implemented
- **API**: Complete REST API with all endpoints

### ⚠️ **Frontend (Needs Testing)**
- **Status**: 85% implemented, 0% tested
- **Priority**: Critical - requires test implementation
- **Features**: All main features implemented
- **UI/UX**: Modern and responsive

### ❌ **Mobile App (Not Implemented)**
- **Status**: 0% implemented
- **Priority**: High for market penetration
- **Timeline**: Planned for Q2 2025

## 🏗️ System Requirements

### **Server Requirements**
- **CPU**: 2+ cores (4+ recommended)
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **Network**: Stable internet connection

### **Software Requirements**
- **Node.js**: 18.0+ LTS
- **PostgreSQL**: 12.0+
- **Nginx**: 1.18+ (reverse proxy)
- **PM2**: Process manager
- **Certbot**: SSL certificates

### **Domain & SSL**
- **Domain**: app4kitas.de (or your domain)
- **SSL Certificate**: Let's Encrypt or commercial
- **DNS**: Proper A/CNAME records

## 🔧 Backend Deployment

### **Step 1: Server Setup**

#### **Update System**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

#### **Install Node.js**
```bash
# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be 18.x.x
npm --version   # Should be 9.x.x
```

#### **Install PostgreSQL**
```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE app4kitas;
CREATE USER app4kitas_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE app4kitas TO app4kitas_user;
\q
```

#### **Install Nginx**
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### **Step 2: Application Setup**

#### **Clone Repository**
```bash
cd /var/www
sudo git clone <repository-url> app4kitas
sudo chown -R $USER:$USER app4kitas
cd app4kitas
```

#### **Backend Setup**
```bash
cd backend

# Install dependencies
npm ci --only=production

# Create environment file
cp .env.example .env
nano .env
```

#### **Environment Configuration**
```env
# Database
DATABASE_URL="postgresql://app4kitas_user:your_secure_password@localhost:5432/app4kitas"

# JWT (CHANGE IN PRODUCTION!)
JWT_SECRET=your_super_secure_jwt_secret_here

# App Configuration
NODE_ENV=production
PORT=4000

# Production Domain
PROD_DOMAIN=https://app4kitas.de

# File Uploads
UPLOADS_DIR=uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_SALT_ROUNDS=10
```

#### **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Create uploads directory
mkdir uploads
chmod 755 uploads

# Run tests (should all pass)
npm test
```

#### **Install PM2**
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application with PM2
pm2 start npm --name "app4kitas-backend" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### **Step 3: Nginx Configuration**

#### **Create Nginx Configuration**
```bash
sudo nano /etc/nginx/sites-available/app4kitas
```

#### **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name app4kitas.de www.app4kitas.de;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app4kitas.de www.app4kitas.de;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/app4kitas.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app4kitas.de/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # File Uploads
    location /uploads/ {
        alias /var/www/app4kitas/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Frontend (when ready)
    location / {
        root /var/www/app4kitas/dashboard/build;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### **Enable Site**
```bash
sudo ln -s /etc/nginx/sites-available/app4kitas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### **Step 4: SSL Certificate**

#### **Install Certbot**
```bash
sudo apt install -y certbot python3-certbot-nginx
```

#### **Obtain SSL Certificate**
```bash
sudo certbot --nginx -d app4kitas.de -d www.app4kitas.de
```

#### **Auto-renewal**
```bash
sudo crontab -e
# Add line for auto-renewal
0 12 * * * /usr/bin/certbot renew --quiet
```

## 💻 Frontend Deployment

### **Step 1: Build Frontend**
```bash
cd /var/www/app4kitas/dashboard

# Install dependencies
npm ci --only=production

# Create environment file
cp .env.example .env
nano .env
```

#### **Frontend Environment**
```env
REACT_APP_BACKEND_URL=https://app4kitas.de/api
REACT_APP_ENVIRONMENT=production
```

#### **Build Application**
```bash
# Build for production
npm run build

# Test build (when tests are implemented)
npm test
```

### **Step 2: Serve Frontend**
```bash
# Install serve for static file serving
sudo npm install -g serve

# Start frontend with PM2
pm2 start serve --name "app4kitas-frontend" -- -s build -l 3000

# Save PM2 configuration
pm2 save
```

## 🔐 Security Configuration

### **Firewall Setup**
```bash
# Install UFW
sudo apt install -y ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### **Database Security**
```bash
# Configure PostgreSQL for production
sudo nano /etc/postgresql/12/main/postgresql.conf

# Add/modify these settings:
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
max_worker_processes = 4
max_parallel_workers_per_gather = 2
max_parallel_workers = 4
max_parallel_maintenance_workers = 2
```

### **Application Security**
```bash
# Set proper file permissions
sudo chown -R www-data:www-data /var/www/app4kitas
sudo chmod -R 755 /var/www/app4kitas
sudo chmod 600 /var/www/app4kitas/backend/.env
```

## 📊 Monitoring & Logging

### **PM2 Monitoring**
```bash
# View application status
pm2 status

# View logs
pm2 logs app4kitas-backend
pm2 logs app4kitas-frontend

# Monitor resources
pm2 monit
```

### **Nginx Logs**
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### **Application Logs**
```bash
# Backend logs
pm2 logs app4kitas-backend

# Database logs
sudo tail -f /var/log/postgresql/postgresql-12-main.log
```

## 🔄 Backup Strategy

### **Database Backup**
```bash
# Create backup script
sudo nano /usr/local/bin/backup-app4kitas.sh
```

#### **Backup Script**
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/app4kitas"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="app4kitas"
DB_USER="app4kitas_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# File uploads backup
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz /var/www/app4kitas/backend/uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

#### **Setup Automated Backups**
```bash
# Make script executable
sudo chmod +x /usr/local/bin/backup-app4kitas.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
0 2 * * * /usr/local/bin/backup-app4kitas.sh
```

## 🚨 Critical Issues to Address

### **Frontend Testing (URGENT)**
- **Status**: 0% test coverage
- **Impact**: Production readiness compromised
- **Action**: Implement comprehensive test suite before production

### **Mobile App (HIGH PRIORITY)**
- **Status**: Not implemented
- **Impact**: Limited market reach
- **Action**: Begin Flutter development

### **Performance Optimization**
- **Status**: Basic optimization implemented
- **Impact**: User experience
- **Action**: Implement advanced caching and optimization

## 📋 Deployment Checklist

### **Pre-Deployment**
- [ ] All 427 backend tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate obtained
- [ ] Domain DNS configured
- [ ] Firewall configured
- [ ] Backup strategy implemented

### **Post-Deployment**
- [ ] API endpoints responding
- [ ] Database connections working
- [ ] File uploads functional
- [ ] SSL certificate valid
- [ ] Monitoring active
- [ ] Logs being generated
- [ ] Backups running

### **Security Verification**
- [ ] HTTPS redirect working
- [ ] Security headers present
- [ ] Rate limiting active
- [ ] File uploads secure
- [ ] Database access restricted
- [ ] Environment variables secure

## 🔧 Maintenance Procedures

### **Daily Tasks**
- [ ] Check application logs
- [ ] Monitor server resources
- [ ] Verify backup completion
- [ ] Check SSL certificate status

### **Weekly Tasks**
- [ ] Review error logs
- [ ] Update dependencies
- [ ] Check security alerts
- [ ] Monitor disk space

### **Monthly Tasks**
- [ ] Performance review
- [ ] Security audit
- [ ] Backup verification
- [ ] SSL certificate renewal

## 📞 Support & Troubleshooting

### **Common Issues**

#### **Application Won't Start**
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs app4kitas-backend

# Restart application
pm2 restart app4kitas-backend
```

#### **Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -U app4kitas_user -h localhost -d app4kitas
```

#### **Nginx Issues**
```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx
```

### **Emergency Procedures**

#### **Rollback Deployment**
```bash
# Stop current deployment
pm2 stop all

# Restore from backup
pg_restore -U app4kitas_user -h localhost -d app4kitas backup_file.sql

# Restart services
pm2 start all
```

#### **Emergency Maintenance**
```bash
# Put application in maintenance mode
echo "Maintenance mode" > /var/www/app4kitas/maintenance.html

# Perform maintenance tasks
# ...

# Remove maintenance mode
rm /var/www/app4kitas/maintenance.html
```

---

**App4KITAs Production Deployment Guide** - Complete guide for production deployment.

**Last Updated**: July 2025  
**Version**: 1.0  
**Status**: 🟡 **BACKEND READY, FRONTEND NEEDS TESTING** 