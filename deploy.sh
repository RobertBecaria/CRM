#!/bin/bash
# CRM Deployment Script
# Usage: ./deploy.sh

set -e

APP_DIR="/opt/CRM"
MONGO_URL="mongodb://localhost:27017"
LOG_FILE="/tmp/uvicorn.log"

echo "=== CRM Deployment Started ==="

# Stop backend
echo "Stopping backend..."
pkill -f "uvicorn server:app" 2>/dev/null || echo "No backend running"
sleep 2

# Pull latest code
echo "Pulling latest code..."
cd "$APP_DIR"
git fetch origin
git reset --hard origin/main

# Update backend
echo "Updating backend..."
cd "$APP_DIR/backend"
source venv/bin/activate
pip install fastapi uvicorn pymongo bcrypt python-jose passlib python-multipart -q

# Build frontend
echo "Building frontend..."
cd "$APP_DIR/frontend"
npm install --legacy-peer-deps --silent
npm run build

# Start backend
echo "Starting backend..."
cd "$APP_DIR/backend"
source venv/bin/activate
nohup bash -c "MONGO_URL=\"$MONGO_URL\" uvicorn server:app --host 0.0.0.0 --port 8000" > "$LOG_FILE" 2>&1 &
sleep 3

# Verify
if pgrep -f "uvicorn server:app" > /dev/null; then
    echo "=== Deployment Complete ==="
        echo "Site: https://xn--l1ahfq.xn--p1ai"
            echo "Logs: tail -f $LOG_FILE"
            else
                echo "ERROR: Server failed to start"
                    cat "$LOG_FILE"
                        exit 1
                        fi
