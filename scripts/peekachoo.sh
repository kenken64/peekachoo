#!/bin/bash

# Peekachoo - Start/Stop Both Frontend and Backend
# Compatible with Ubuntu and macOS

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_PATH="$SCRIPT_DIR/../peekachoo-frontend"
BACKEND_PATH="$SCRIPT_DIR/../peekachoo-backend"

ACTION="${1:-start}"

start_services() {
    echo -e "\033[32mStarting Peekachoo Backend...\033[0m"
    
    # Install backend dependencies if needed
    if [ ! -d "$BACKEND_PATH/node_modules" ]; then
        echo -e "\033[33mInstalling backend dependencies...\033[0m"
        (cd "$BACKEND_PATH" && npm install)
    fi

    # Start backend in background
    (cd "$BACKEND_PATH" && npm run dev) &
    BACKEND_PID=$!
    echo "Backend started with PID: $BACKEND_PID"

    echo -e "\033[32mStarting Peekachoo Frontend...\033[0m"
    
    # Install frontend dependencies if needed
    if [ ! -d "$FRONTEND_PATH/node_modules" ]; then
        echo -e "\033[33mInstalling frontend dependencies...\033[0m"
        (cd "$FRONTEND_PATH" && npm install)
    fi

    # Start frontend in background
    (cd "$FRONTEND_PATH" && npm start) &
    FRONTEND_PID=$!
    echo "Frontend started with PID: $FRONTEND_PID"

    echo -e "\033[36mBoth frontend and backend started.\033[0m"
    echo "Press Ctrl+C to stop all services."
    
    # Wait for both processes
    wait
}

stop_services() {
    echo -e "\033[33mStopping Peekachoo Services...\033[0m"

    # Find and kill backend processes (server.js)
    BACKEND_PIDS=$(pgrep -f "node.*server\.js" 2>/dev/null)
    if [ -n "$BACKEND_PIDS" ]; then
        echo -e "\033[31mStopping backend processes: $BACKEND_PIDS\033[0m"
        echo "$BACKEND_PIDS" | xargs kill -9 2>/dev/null
        echo -e "\033[32mBackend stopped.\033[0m"
    else
        echo -e "\033[36mNo backend processes found.\033[0m"
    fi

    # Find and kill frontend processes (webpack/browser-sync)
    FRONTEND_PIDS=$(pgrep -f "node.*(webpack|browser-sync)" 2>/dev/null)
    if [ -n "$FRONTEND_PIDS" ]; then
        echo -e "\033[31mStopping frontend processes: $FRONTEND_PIDS\033[0m"
        echo "$FRONTEND_PIDS" | xargs kill -9 2>/dev/null
        echo -e "\033[32mFrontend stopped.\033[0m"
    else
        echo -e "\033[36mNo frontend processes found.\033[0m"
    fi

    echo -e "\033[32mAll services stopped.\033[0m"
}

case "$ACTION" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    *)
        echo "Usage: $0 {start|stop}"
        echo "  start - Start both frontend and backend"
        echo "  stop  - Stop all running services"
        exit 1
        ;;
esac
