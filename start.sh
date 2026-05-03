#!/bin/bash
echo "========================================="
echo "  SmartBreak - Starting All Services"
echo "========================================="

# Start Backend
echo ""
echo "▶ Starting Backend (FastAPI on :8000)..."
cd backend
pip install -r requirements.txt -q
python main.py &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"
cd ..

sleep 2

# Start User Frontend
echo ""
echo "▶ Starting User Frontend (React on :3000)..."
cd frontend-user
npm install -q 2>/dev/null
npm start &
USER_PID=$!
echo "  User Frontend PID: $USER_PID"
cd ..

# Start Admin Frontend
echo ""
echo "▶ Starting Admin Frontend (React on :3001)..."
cd frontend-admin
npm install -q 2>/dev/null
npm start &
ADMIN_PID=$!
echo "  Admin Frontend PID: $ADMIN_PID"
cd ..

echo ""
echo "========================================="
echo "  All services started!"
echo ""
echo "  User Site:  http://localhost:3000"
echo "  Admin Site: http://localhost:3001"
echo "  API:        http://localhost:8000"
echo ""
echo "  Admin credentials:"
echo "  Email: 230103148@sdu.edu.kz | Password: Admin@1"
echo "  Email: 230103256@sdu.edu.kz | Password: Admin@2"
echo "  Email: 230103126@sdu.edu.kz | Password: Admin@3"
echo "  Email: 230103220@sdu.edu.kz | Password: Admin@4"
echo "========================================="

wait
