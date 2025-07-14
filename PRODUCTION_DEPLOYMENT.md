# 🚀 Production Deployment Guide

## 📊 Status: **BACKEND BEREIT - DEPLOYMENT PLAN** ✅

**401 Tests erfolgreich** | **Enterprise Security** | **Production-ready Backend**

## 🎯 Deployment Overview

### Zielumgebung
- **Hosting**: OVH VPS (Europa, DSGVO-konform)
- **Domain**: app4kitas.de
- **SSL**: Let's Encrypt (automatisch)
- **Database**: PostgreSQL 14+ (dedicated)
- **Monitoring**: Grafana + Prometheus
- **Backup**: Automatische Snapshots

### Systemarchitektur
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Web Server    │    │   Application   │
│   (Nginx)       │    │   (Nginx)       │    │   (Node.js)     │
│                 │    │                 │    │                 │
│ • SSL/TLS       │    │ • Static Files  │    │ • API Server    │
│ • Rate Limiting │    │ • Proxy         │    │ • File Uploads  │
│ • Caching       │    │ • Compression   │    │ • Background    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Database      │
                       │   (PostgreSQL)  │
                       │                 │
                       │ • Primary DB    │
                       │ • Read Replicas │
                       │ • Backups       │
                       └─────────────────┘
```

## 🛠️ Server Setup

### VPS Spezifikationen
```bash
# Minimum Requirements
CPU: 4 Cores (Intel Xeon)
RAM: 8GB DDR4
Storage: 100GB SSD
Network: 1Gbps
OS: Ubuntu 22.04 LTS

# Recommended
CPU: 8 Cores (Intel Xeon)
RAM: 16GB DDR4
Storage: 200GB SSD
Network: 2.5Gbps
OS: Ubuntu 22.04 LTS
```

### Initial Server Setup
```bash
# 1. Server aktualisieren
sudo apt update && sudo apt upgrade -y

# 2. Firewall konfigurieren
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# 3. Benutzer erstellen
sudo adduser app4kitas
sudo usermod -aG sudo app4kitas

# 4. SSH Key Authentication
mkdir ~/.ssh
nano ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# 5. SSH Hardening
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no
# Port 2222 (optional)
sudo systemctl restart ssh
```

## 🗄️ Database Setup

### PostgreSQL Installation
```bash
# PostgreSQL 14 installieren
sudo apt install postgresql postgresql-contrib

# PostgreSQL konfigurieren
sudo -u postgres psql

# Datenbank erstellen
CREATE DATABASE app4kitas;
CREATE USER app4kitas_user WITH ENCRYPTED PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE app4kitas TO app4kitas_user;
ALTER USER app4kitas_user CREATEDB;

# PostgreSQL Konfiguration
sudo nano /etc/postgresql/14/main/postgresql.conf
# max_connections = 200
# shared_buffers = 256MB
# effective_cache_size = 1GB
# maintenance_work_mem = 64MB
# checkpoint_completion_target = 0.9
# wal_buffers = 16MB
# default_statistics_target = 100

sudo systemctl restart postgresql
```

### Database Security
```sql
-- SSL aktivieren
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/etc/ssl/certs/ssl-cert-snakeoil.pem';
ALTER SYSTEM SET ssl_key_file = '/etc/ssl/private/ssl-cert-snakeoil.key';

-- Backup-Strategie
-- Tägliche Snapshots
-- Wöchentliche Full Backups
-- Monatliche Archive
```

## 🌐 Web Server Setup

### Nginx Installation
```bash
# Nginx installieren
sudo apt install nginx

# Nginx Konfiguration
sudo nano /etc/nginx/sites-available/app4kitas

server {
    listen 80;
    server_name app4kitas.de www.app4kitas.de;
    
    # Redirect to HTTPS
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
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    # API Proxy
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Login Rate Limiting
    location /api/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:4000;
        # ... same proxy settings
    }
    
    # Static Files
    location / {
        root /var/www/app4kitas;
        try_files $uri $uri/ /index.html;
        
        # Caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # File Uploads
    location /uploads/ {
        alias /var/www/app4kitas/uploads/;
        add_header Cache-Control "public, max-age=86400";
    }
}

# Nginx aktivieren
sudo ln -s /etc/nginx/sites-available/app4kitas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Certificate (Let's Encrypt)
```bash
# Certbot installieren
sudo apt install certbot python3-certbot-nginx

# SSL Certificate erstellen
sudo certbot --nginx -d app4kitas.de -d www.app4kitas.de

# Auto-renewal
sudo crontab -e
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🚀 Application Deployment

### Node.js Setup
```bash
# Node.js 18 installieren
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 installieren
sudo npm install -g pm2

# Application Directory
sudo mkdir -p /var/www/app4kitas
sudo chown app4kitas:app4kitas /var/www/app4kitas
```

### Application Deployment
```bash
# Code deployen
cd /var/www/app4kitas
git clone https://github.com/your-org/app4kitas.git .
cd backend

# Dependencies installieren
npm ci --only=production

# Environment konfigurieren
cp .env.example .env
nano .env

# Production Environment
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://app4kitas_user:secure_password@localhost:5432/app4kitas
JWT_SECRET=your_very_secure_jwt_secret_64_characters_minimum
PROD_DOMAIN=https://app4kitas.de
CORS_ORIGIN=https://app4kitas.de
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
UPLOADS_DIR=/var/www/app4kitas/uploads

# Database Setup
npx prisma generate
npx prisma migrate deploy

# Uploads Directory
mkdir -p /var/www/app4kitas/uploads
chmod 755 /var/www/app4kitas/uploads

# PM2 Configuration
pm2 ecosystem
```

### PM2 Ecosystem Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'app4kitas-backend',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/var/log/app4kitas/error.log',
    out_file: '/var/log/app4kitas/out.log',
    log_file: '/var/log/app4kitas/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### Frontend Deployment
```bash
# Frontend builden
cd /var/www/app4kitas/dashboard
npm ci
npm run build

# Build deployen
sudo cp -r build/* /var/www/app4kitas/
sudo chown -R www-data:www-data /var/www/app4kitas/
```

## 📊 Monitoring & Logging

### Application Monitoring
```bash
# PM2 Monitoring
pm2 monit
pm2 logs app4kitas-backend

# System Monitoring
sudo apt install htop iotop nethogs
```

### Log Management
```bash
# Log Directory
sudo mkdir -p /var/log/app4kitas
sudo chown app4kitas:app4kitas /var/log/app4kitas

# Log Rotation
sudo nano /etc/logrotate.d/app4kitas

/var/log/app4kitas/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 app4kitas app4kitas
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Grafana + Prometheus Setup
```bash
# Prometheus installieren
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvf prometheus-*.tar.gz
cd prometheus-*

# Prometheus konfigurieren
nano prometheus.yml

global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'app4kitas-backend'
    static_configs:
      - targets: ['localhost:4000']

# Grafana installieren
sudo apt install grafana
sudo systemctl enable grafana-server
sudo systemctl start grafana-server
```

## 🔒 Security Configuration

### Firewall Rules
```bash
# UFW Konfiguration
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5432/tcp  # PostgreSQL (if external)
sudo ufw enable
```

### Fail2Ban Setup
```bash
# Fail2Ban installieren
sudo apt install fail2ban

# SSH Protection
sudo nano /etc/fail2ban/jail.local

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

# Nginx Protection
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600

sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Security Headers
```nginx
# Nginx Security Headers
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:;";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()";
```

## 🔄 Backup Strategy

### Database Backups
```bash
# Backup Script
nano /opt/backup-db.sh

#!/bin/bash
BACKUP_DIR="/var/backups/app4kitas"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="app4kitas"

mkdir -p $BACKUP_DIR

# Full Backup
pg_dump -h localhost -U app4kitas_user $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

# Log backup
echo "Database backup completed: $DATE" >> /var/log/app4kitas/backup.log

chmod +x /opt/backup-db.sh

# Cron Job (daily at 2 AM)
crontab -e
0 2 * * * /opt/backup-db.sh
```

### File Backups
```bash
# File Backup Script
nano /opt/backup-files.sh

#!/bin/bash
BACKUP_DIR="/var/backups/app4kitas"
DATE=$(date +%Y%m%d_%H%M%S)
SOURCE_DIR="/var/www/app4kitas/uploads"

mkdir -p $BACKUP_DIR

# Uploads backup
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz -C $SOURCE_DIR .

# Keep only last 7 days
find $BACKUP_DIR -name "uploads_backup_*.tar.gz" -mtime +7 -delete

echo "File backup completed: $DATE" >> /var/log/app4kitas/backup.log

chmod +x /opt/backup-files.sh

# Cron Job (daily at 3 AM)
crontab -e
0 3 * * * /opt/backup-files.sh
```

## 📈 Performance Optimization

### Node.js Optimization
```javascript
// server.js optimizations
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // Worker process
  require('./src/app.js');
}
```

### Database Optimization
```sql
-- Indexes für Performance
CREATE INDEX idx_children_institution_id ON children(institution_id);
CREATE INDEX idx_checkin_child_date ON check_in_log(child_id, check_in_time);
CREATE INDEX idx_messages_channel_date ON messages(channel_id, created_at);
CREATE INDEX idx_notes_child_date ON notes(child_id, created_at);

-- Query Optimization
ANALYZE children;
ANALYZE check_in_log;
ANALYZE messages;
ANALYZE notes;
```

### Nginx Caching
```nginx
# API Caching
location /api/stats {
    proxy_cache STATIC;
    proxy_cache_valid 200 5m;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    proxy_cache_lock on;
    
    proxy_pass http://localhost:4000;
    # ... proxy settings
}

# Cache Zones
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=STATIC:10m inactive=7d use_temp_path=off;
```

## 🚨 Disaster Recovery

### Recovery Procedures
```bash
# Database Recovery
pg_restore -h localhost -U app4kitas_user -d app4kitas /var/backups/app4kitas/db_backup_20240101_020000.sql.gz

# Application Recovery
cd /var/www/app4kitas
git pull origin main
npm ci --only=production
npx prisma migrate deploy
pm2 restart app4kitas-backend

# File Recovery
tar -xzf /var/backups/app4kitas/uploads_backup_20240101_030000.tar.gz -C /var/www/app4kitas/uploads/
```

### Health Checks
```bash
# Health Check Script
nano /opt/health-check.sh

#!/bin/bash

# Check if application is running
if ! pm2 list | grep -q "app4kitas-backend.*online"; then
    echo "Application is down, restarting..."
    pm2 restart app4kitas-backend
    echo "$(date): Application restarted" >> /var/log/app4kitas/health.log
fi

# Check database connection
if ! pg_isready -h localhost -U app4kitas_user; then
    echo "Database connection failed"
    echo "$(date): Database connection failed" >> /var/log/app4kitas/health.log
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "Disk space critical: ${DISK_USAGE}%"
    echo "$(date): Disk space critical: ${DISK_USAGE}%" >> /var/log/app4kitas/health.log
fi

chmod +x /opt/health-check.sh

# Cron Job (every 5 minutes)
crontab -e
*/5 * * * * /opt/health-check.sh
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Server-Setup abgeschlossen
- [ ] SSL-Zertifikat installiert
- [ ] Firewall konfiguriert
- [ ] Database eingerichtet
- [ ] Backup-Strategie implementiert
- [ ] Monitoring eingerichtet

### Application Deployment
- [ ] Code deployed
- [ ] Environment variables gesetzt
- [ ] Database migrations ausgeführt
- [ ] PM2 gestartet
- [ ] Nginx konfiguriert
- [ ] SSL aktiviert

### Post-Deployment
- [ ] Health checks bestanden
- [ ] Performance getestet
- [ ] Security audit durchgeführt
- [ ] Backup getestet
- [ ] Monitoring aktiviert
- [ ] Documentation aktualisiert

## 🔧 Maintenance Procedures

### Regular Maintenance
```bash
# Weekly Tasks
sudo apt update && sudo apt upgrade -y
pm2 update
sudo systemctl restart nginx
sudo systemctl restart postgresql

# Monthly Tasks
sudo certbot renew
sudo logrotate -f /etc/logrotate.d/app4kitas
sudo find /var/log -name "*.log" -mtime +30 -delete

# Quarterly Tasks
sudo fail2ban-client reload
sudo ufw --force reset
sudo ufw enable
```

### Monitoring Alerts
- **High CPU Usage**: > 80% for 5 minutes
- **High Memory Usage**: > 90% for 5 minutes
- **Disk Space**: > 85% usage
- **Application Errors**: > 10 errors per minute
- **Database Connections**: > 80% of max connections

---

**Status**: ✅ **BACKEND BEREIT - Deployment möglich**

**Nächste Schritte**:
1. Server-Setup durchführen
2. SSL-Zertifikat installieren
3. Application deployen
4. Monitoring einrichten
5. Backup-Strategie testen 