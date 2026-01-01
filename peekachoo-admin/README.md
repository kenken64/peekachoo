# Peekachoo Admin

Admin panel for managing Peekachoo users. Built with Next.js and Tailwind CSS.

## Features

- Password-protected admin access
- View all registered users with search and pagination
- Delete users (with cascade delete for related data)
- Real-time user count display
- Responsive design

## Architecture

This admin panel connects to the peekachoo-backend API for all data operations. It uses:
- Admin password authentication for UI access
- API key authentication for backend API calls

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Configure `.env.local`:
```env
# Set your admin password (for UI login)
ADMIN_PASSWORD=your_secure_password

# Backend API URL
BACKEND_URL=http://localhost:3000

# API key for backend admin endpoints (must match ADMIN_API_KEY in backend)
ADMIN_API_KEY=your_api_key
```

## Development

```bash
npm run dev
```

The admin panel will be available at http://localhost:3000

**Note:** Make sure peekachoo-backend is running and configured with the same `ADMIN_API_KEY`.

## Production Build

```bash
npm run build
npm start
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Login with admin password |
| `/api/auth/logout` | POST | Logout |
| `/api/auth/check` | GET | Check authentication status |
| `/api/users` | GET | Get all users (proxies to backend) |
| `/api/users/[id]` | GET | Get user by ID (proxies to backend) |
| `/api/users/[id]` | DELETE | Delete user by ID (proxies to backend) |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_PASSWORD` | Password for admin UI login | `admin123` |
| `BACKEND_URL` | URL of the peekachoo-backend API | `http://localhost:3000` |
| `ADMIN_API_KEY` | API key for backend admin endpoints | (required) |

## Railway Deployment

This app is configured for deployment on Railway with Docker.

### Setup

1. Create a new project on Railway
2. Connect your GitHub repository
3. Set the root directory to `peekachoo-admin`
4. Configure environment variables in Railway dashboard:
   - `ADMIN_PASSWORD` - Your secure admin password
   - `BACKEND_URL` - URL of your peekachoo-backend service
   - `ADMIN_API_KEY` - API key matching the backend configuration

### Docker Build

The Dockerfile uses a multi-stage build:
- **Builder stage**: Compiles the Next.js app with standalone output
- **Runner stage**: Minimal production image with only necessary files

### Local Docker Testing

```bash
# Build the image
docker build -t peekachoo-admin .

# Run with environment variables
docker run -p 3000:3000 \
  -e ADMIN_PASSWORD=your_password \
  -e BACKEND_URL=http://host.docker.internal:3000 \
  -e ADMIN_API_KEY=your_api_key \
  peekachoo-admin
```
