#!/bin/bash

# Peekachoo Start Script
# Starts both frontend and backend servers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$PROJECT_DIR/peekachoo-frontend"
BACKEND_DIR="$PROJECT_DIR/peekachoo-backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Starting Peekachoo Services${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if directories exist
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}Error: Frontend directory not found at $FRONTEND_DIR${NC}"
    exit 1
fi

if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}Error: Backend directory not found at $BACKEND_DIR${NC}"
    exit 1
fi

# Create PID directory
PID_DIR="$PROJECT_DIR/scripts/.pids"
mkdir -p "$PID_DIR"

# Start Backend
echo -e "${YELLOW}Starting Backend...${NC}"
cd "$BACKEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo -e "${YELLOW}Creating .env from .env.example...${NC}"
    cp .env.example .env
fi

npm run dev > "$PID_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$PID_DIR/backend.pid"
echo -e "${GREEN}Backend started with PID: $BACKEND_PID${NC}"

# Wait a moment for backend to initialize
sleep 2

# Start Frontend
echo -e "${YELLOW}Starting Frontend...${NC}"
cd "$FRONTEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

npm run dev > "$PID_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$PID_DIR/frontend.pid"
echo -e "${GREEN}Frontend started with PID: $FRONTEND_PID${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   All Services Started Successfully${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Backend:  ${YELLOW}http://localhost:3000${NC} (API)"
echo -e "Frontend: ${YELLOW}http://localhost:3000${NC} (Game)"
echo ""
echo -e "Logs:"
echo -e "  Backend:  $PID_DIR/backend.log"
echo -e "  Frontend: $PID_DIR/frontend.log"
echo ""
echo -e "Run ${YELLOW}./scripts/stop.sh${NC} to stop all services"
