# КинезиоCRM - Deployment Guide

## 🚀 Quick Deployment

SSH to server and run:
```bash
cd /opt/CRM
./deploy.sh
```

## 📋 Manual Deployment

### 1. Stop Backend
```bash
pkill -f "uvicorn server:app"
```

### 2. Pull Code
```bash
cd /opt/CRM
git fetch origin
git reset --hard origin/main
```

### 3. Update Backend
```bash
cd /opt/CRM/backend
source venv/bin/activate
pip install fastapi uvicorn pymongo bcrypt python-jose passlib python-multipart -q
```

### 4. Build Frontend
```bash
cd /opt/CRM/frontend
npm install --legacy-peer-deps --silent
npm run build
```

### 5. Start Backend
```bash
cd /opt/CRM/backend
source venv/bin/activate
nohup bash -c 'MONGO_URL="mongodb://localhost:27017" uvicorn server:app --host 0.0.0.0 --port 8000' > /tmp/uvicorn.log 2>&1 &
```

## 🔧 Configuration

| Item | Value |
|------|-------|
| Server IP | 45.155.205.206 |
| Domain | asliya.ru |
| App Directory | /opt/CRM |
| Backend Port | 8000 |
| MongoDB | mongodb://localhost:27017 |
| Logs | /tmp/uvicorn.log |
| Nginx Config | /etc/nginx/sites-available/crm |

## 🔒 SSL Certificate

Get/renew SSL:
```bash
sudo certbot --nginx -d asliya.ru -d www.asliya.ru
```

## 🗄️ Database

MongoDB data is stored separately - deployments do NOT affect your data.

Backup:
```bash
mongodump --out /backup/mongodb/$(date +%Y%m%d)
```

## 🐛 Troubleshooting

Check if backend running:
```bash
pgrep -f "uvicorn server:app"
```

View logs:
```bash
tail -f /tmp/uvicorn.log
```

Test nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---
*Updated: January 2026*
