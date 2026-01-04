# Peekachoo

A browser-based territory capture game inspired by the classic arcade game **Qix**. Players claim territory on a game board to progressively reveal hidden Pokemon images.

[![Demo Video](https://img.youtube.com/vi/LgnAFFXq-aA/0.jpg)](https://youtu.be/LgnAFFXq-aA)

▶️ **[Watch Demo Video](https://youtu.be/LgnAFFXq-aA)**

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Phaser](https://img.shields.io/badge/Phaser-3.10.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Territory Claiming Gameplay** - Draw paths to claim territory and reveal hidden images
- **Progressive Difficulty** - Multiple levels with increasing enemy count and speed
- **WebAuthn Authentication** - Passwordless login using device biometrics or security keys
- **Custom Game Creation** - Create and share games with custom Pokemon levels
- **Quiz System** - Answer Pokemon trivia after completing each level
- **Mobile Support** - Virtual D-pad for touch devices
- **Retro Styling** - NES.css for nostalgic pixel-art UI

## Tech Stack

### Frontend
| Component | Technology |
|-----------|------------|
| Game Engine | Phaser 3.10.1 |
| Language | TypeScript 4.9.5 |
| Build Tool | Webpack 3.11.0 |
| CSS Framework | NES.css 2.2.1 |
| Dev Server | BrowserSync |

### Backend
| Component | Technology |
|-----------|------------|
| Runtime | Node.js 18+ |
| Framework | Express.js 4.18.2 |
| Database | SQLite (sql.js) |
| Authentication | SimpleWebAuthn 10.0.0 |
| Token | JWT (jsonwebtoken) |
| External API | PokeAPI, OpenAI (optional) |

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- Git

## Installation

```bash
# Clone the repository with submodules
git clone --recursive https://github.com/kenken64/peekachoo.git
cd peekachoo

# If already cloned, initialize submodules
git submodule update --init --recursive
```

### Backend Setup

```bash
cd peekachoo-backend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Update .env with your settings (see Configuration section)
```

### Frontend Setup

```bash
cd peekachoo-frontend

# Install dependencies
npm install
```

## Quick Start

Use the provided scripts to start both services:

### Windows (PowerShell)
```powershell
.\scripts\peekachoo.ps1
```

### Linux/macOS
```bash
./scripts/peekachoo.sh
```

### Manual Start

**Terminal 1 - Backend:**
```bash
cd peekachoo-backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd peekachoo-frontend
npm run dev
```

Access the game at `http://localhost:8080`

## Project Structure

```
peekachoo/
├── peekachoo-frontend/        # Phaser 3 + TypeScript frontend
│   ├── src/
│   │   ├── main.ts            # Game initialization & config
│   │   ├── scenes/            # Phaser game scenes
│   │   │   ├── login-scene.ts
│   │   │   ├── menu-scene.ts
│   │   │   ├── game-create-scene.ts
│   │   │   └── qix-scene.ts
│   │   ├── objects/           # Game entities (player, enemies, grid)
│   │   ├── services/          # Backend API integrations
│   │   └── utils/             # Helper utilities
│   └── package.json
│
├── peekachoo-backend/         # Express.js backend
│   ├── src/
│   │   ├── server.js          # Server initialization
│   │   ├── app.js             # Express app setup
│   │   ├── config/            # Configuration & database
│   │   ├── controllers/       # Route handlers
│   │   ├── routes/            # API routes
│   │   ├── middlewares/       # Express middleware
│   │   └── services/          # Business logic
│   └── package.json
│
├── scripts/                   # Start scripts
└── README.md
```

## Game Controls

### Desktop
| Key | Action |
|-----|--------|
| Arrow Up | Move up |
| Arrow Down | Move down |
| Arrow Left | Move left |
| Arrow Right | Move right |

### Mobile
- **Virtual D-Pad** - Touch controls displayed on mobile devices

## Gameplay

1. **Objective**: Claim 60%+ of the play area to complete a level
2. **Movement**: Move along borders or claimed territory
3. **Claiming**: Venture into unclaimed territory and return to border to claim area
4. **Enemies**:
   - **Qix** (red lines) - Bounce in unclaimed areas, avoid while drawing
   - **Sparkies** (red dots) - Patrol claimed borders
5. **Lives**: Lose a life when touched by enemies while drawing
6. **Quiz**: Answer a Pokemon trivia question after completing each level

## Configuration

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | JWT signing key | (required) |
| `DATABASE_PATH` | SQLite database path | `./data/peekachoo.db` |
| `CORS_ORIGIN` | Frontend URL for CORS | `http://localhost:8080` |
| `ORIGIN` | WebAuthn origin | `http://localhost:8080` |
| `RP_ID` | WebAuthn relying party ID | `localhost` |
| `OPENAI_API_KEY` | OpenAI API key (optional) | - |

### Frontend Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `API_URL` | Backend API URL | `http://localhost:3000/api` |

## API Endpoints

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health status |
| GET | `/api` | API welcome message |

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/config` | WebAuthn configuration |
| GET | `/auth/check-username/:username` | Check username availability |
| POST | `/auth/register/start` | Start passkey registration |
| POST | `/auth/register/complete` | Complete registration |
| POST | `/auth/login/start` | Start authentication |
| POST | `/auth/login/complete` | Complete authentication |
| GET | `/auth/me` | Get current user (protected) |

### Pokemon (`/api/pokemon`) - Protected
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/pokemon/sync` | Sync Pokemon from PokeAPI |
| GET | `/pokemon` | Get all Pokemon (paginated) |
| GET | `/pokemon/search?q=name` | Search by name |
| GET | `/pokemon/type/:type` | Filter by type |
| GET | `/pokemon/:id` | Get by ID |

### Games (`/api/games`) - Protected
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/games` | Create new game |
| GET | `/games/my-games` | Get user's games |
| GET | `/games/published` | Get published games |
| GET | `/games/:id` | Get game by ID |
| PUT | `/games/:id` | Update game |
| PATCH | `/games/:id/publish` | Toggle publish status |
| DELETE | `/games/:id` | Delete game |
| POST | `/games/:id/play` | Increment play count |

### Quiz (`/api/quiz`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/quiz/generate` | Generate quiz question |

## Docker Deployment

### Backend
```bash
docker build -t peekachoo-backend ./peekachoo-backend

docker run -p 3000:3000 \
  -e JWT_SECRET=your-secret-key \
  -e CORS_ORIGIN=https://your-frontend.com \
  -e ORIGIN=https://your-frontend.com \
  -e RP_ID=your-frontend.com \
  -v peekachoo-data:/app/data \
  peekachoo-backend
```

**Important**: Mount a volume for `/app/data` to persist the SQLite database.

### Frontend
```bash
docker build -t peekachoo-frontend ./peekachoo-frontend

docker run -p 8080:8080 \
  -e VITE_API_URL=https://your-backend-url/api \
  peekachoo-frontend
```

## Development

### Frontend Commands
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run deploy` | Create production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Mocha tests |

### Backend Commands
| Command | Description |
|---------|-------------|
| `npm start` | Start the server |
| `npm run dev` | Start with auto-reload |

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

Requires WebAuthn support for authentication.

## Security

- JWT tokens expire after 24 hours
- WebAuthn prevents phishing attacks
- Counter validation detects cloned authenticators
- CORS restricts cross-origin requests
- Environment variables for sensitive data

## License

MIT
