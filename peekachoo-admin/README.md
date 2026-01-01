# Peekachoo Admin

Admin panel for managing Peekachoo users. Built with Next.js and Tailwind CSS.

## Features

- Password-protected admin access
- View all registered users
- Delete users (with cascade delete for related data)
- Responsive design

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
# Set your admin password
ADMIN_PASSWORD=your_secure_password

# Path to SQLite database (relative to this folder)
DATABASE_PATH=../peekachoo-backend/data/peekachoo.db
```

## Development

```bash
npm run dev
```

The admin panel will be available at http://localhost:3000

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
| `/api/users` | GET | Get all users |
| `/api/users/[id]` | GET | Get user by ID |
| `/api/users/[id]` | DELETE | Delete user by ID |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_PASSWORD` | Password for admin login | `admin123` |
| `DATABASE_PATH` | Path to SQLite database | `../peekachoo-backend/data/peekachoo.db` |

## Railway Deployment

This app is configured for deployment on Railway with Docker.

### Setup

1. Create a new project on Railway
2. Connect your GitHub repository
3. Set the root directory to `peekachoo-admin`
4. Configure environment variables in Railway dashboard:
   - `ADMIN_PASSWORD` - Your secure admin password
   - `DATABASE_PATH` - Path to SQLite database (default: `/app/data/peekachoo.db`)

### Docker Build

The Dockerfile uses a multi-stage build:
- **Builder stage**: Compiles the Next.js app with standalone output
- **Runner stage**: Minimal production image with only necessary files

### Persistent Storage

For the SQLite database to persist across deployments, mount a volume at `/app/data` in Railway:
1. Go to your service settings
2. Add a volume mount: `/app/data`
3. This ensures the database persists across container restarts

### Local Docker Testing

```bash
# Build the image
docker build -t peekachoo-admin .

# Run with environment variables
docker run -p 3000:3000 \
  -e ADMIN_PASSWORD=your_password \
  -v $(pwd)/data:/app/data \
  peekachoo-admin
```
