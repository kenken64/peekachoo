# Peekachoo Game Architecture

A Qix-style territory capture game with Pokemon theming, featuring passkey authentication, real-time leaderboards, and achievement systems.

## Table of Contents

1. [System Overview](#system-overview)
2. [Tech Stack](#tech-stack)
3. [Authentication Flow](#authentication-flow)
4. [Game Logic](#game-logic)
5. [Score & Session System](#score--session-system)
6. [Leaderboard System](#leaderboard-system)
7. [Achievement System](#achievement-system)
8. [WebSocket Integration](#websocket-integration)
9. [Database Schema](#database-schema)
10. [API Endpoints](#api-endpoints)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Port 3001)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ LoginScene  │  │  MenuScene  │  │  QixScene   │              │
│  │ (WebAuthn)  │  │ (Game List) │  │ (Gameplay)  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Leaderboard │  │ StatsScene  │  │ GameCreate  │              │
│  │   Scene     │  │(Collection) │  │   Scene     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                          │                                       │
│         ┌────────────────┼────────────────┐                     │
│         ▼                ▼                ▼                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Session   │  │  WebSocket  │  │Notification │              │
│  │    Store    │  │   Service   │  │   Manager   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend (Port 3000)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │    Auth     │  │ Leaderboard │  │    Stats    │              │
│  │ Controller  │  │ Controller  │  │ Controller  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │Achievement  │  │   Score     │  │  WebSocket  │              │
│  │ Controller  │  │  Service    │  │   Service   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                          │                                       │
│                          ▼                                       │
│                 ┌─────────────────┐                             │
│                 │  SQLite Database │                             │
│                 └─────────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
- **Phaser 3.10** - Game engine
- **TypeScript** - Type-safe JavaScript
- **Webpack** - Module bundler
- **BrowserSync** - Dev server (Port 3001)
- **NES.css** - Retro CSS framework

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **SQLite** (better-sqlite3) - Database
- **SimpleWebAuthn** - Passkey authentication
- **ws** - WebSocket server
- **JWT** - Token authentication

---

## Authentication Flow

### Passkey Registration
```
┌────────┐          ┌────────┐          ┌────────┐
│ Client │          │ Server │          │  Auth  │
└───┬────┘          └───┬────┘          └───┬────┘
    │                   │                   │
    │ POST /auth/register/start             │
    │ {username}        │                   │
    │──────────────────>│                   │
    │                   │                   │
    │  Registration     │                   │
    │  Options + ChallengeId                │
    │<──────────────────│                   │
    │                   │                   │
    │  navigator.credentials.create()       │
    │──────────────────────────────────────>│
    │                   │                   │
    │  Credential Response                  │
    │<──────────────────────────────────────│
    │                   │                   │
    │ POST /auth/register/complete          │
    │ {challengeId, response}               │
    │──────────────────>│                   │
    │                   │                   │
    │  {token, user}    │                   │
    │<──────────────────│                   │
    └───────────────────┴───────────────────┘
```

### Passkey Login
```
┌────────┐          ┌────────┐          ┌────────┐
│ Client │          │ Server │          │  Auth  │
└───┬────┘          └───┬────┘          └───┬────┘
    │                   │                   │
    │ POST /auth/login/start                │
    │ {username}        │                   │
    │──────────────────>│                   │
    │                   │                   │
    │  Auth Options     │                   │
    │  + ChallengeId    │                   │
    │<──────────────────│                   │
    │                   │                   │
    │  navigator.credentials.get()          │
    │──────────────────────────────────────>│
    │                   │                   │
    │  Assertion        │                   │
    │<──────────────────────────────────────│
    │                   │                   │
    │ POST /auth/login/complete             │
    │ {challengeId, response}               │
    │──────────────────>│                   │
    │                   │                   │
    │  {token, user}    │                   │
    │<──────────────────│                   │
    └───────────────────┴───────────────────┘
```

---

## Game Logic

### Scene Flow
```
LoginScene ──> MenuScene ──┬──> QixScene (Play Game)
                           ├──> LeaderboardScene
                           ├──> StatsScene
                           └──> GameCreateScene
```

### Qix Gameplay Mechanics

#### Core Concepts
1. **Grid**: Playing field where player claims territory
2. **Player**: Moves along borders and draws lines
3. **Sparkies**: Enemy that patrols borders
4. **Qix**: Bouncing enemy in unclaimed territory
5. **Territory**: Percentage of grid claimed by player

#### Win Condition
- Claim **75%+** of the territory to reveal the Pokemon and advance

#### Loss Conditions
- Sparky touches player on border
- Qix touches player's active drawing line

### Level Progression
```typescript
interface Level {
    coverageTarget: number;  // % needed to win (starts at 60%)
    numSparkies: number;     // Border enemies
    numQixes: number;        // Center enemies
    qixSpeed: number;        // Enemy speed (increases)
}
```

### Pokemon Reveal System
1. Player completes level (75%+ territory)
2. Full Pokemon image revealed
3. Quiz shown about the Pokemon
4. Correct answer = Score submitted + Next level
5. Wrong answer = Try again (unlimited attempts)

---

## Score & Session System

### Session Lifecycle
```
┌─────────────────────────────────────────────────────────────┐
│                      Game Session                            │
│                                                              │
│  startSession() ──> startLevel() ──> updateTerritory()      │
│        │                 │                  │                │
│        │                 │           recordDeath()           │
│        │                 │                  │                │
│        │                 └──> completeLevel() ──> submit     │
│        │                           │            score to     │
│        │                           │            backend      │
│        │                           │                         │
│        └──────────────> endSession()                         │
└─────────────────────────────────────────────────────────────┘
```

### Score Calculation
```typescript
// Backend: scoreService.js
function calculateScore(data) {
    const {
        level,
        territoryPercentage,
        timeSeconds,
        deaths,
        quizAttempts,
        streak
    } = data;

    // Base score from territory
    let territoryScore = Math.floor(territoryPercentage * 10);

    // Level multiplier
    territoryScore *= (1 + (level - 1) * 0.1);

    // Time bonus (faster = more points)
    const timeBonus = Math.max(0, 300 - timeSeconds);

    // Life bonus (no deaths = bonus)
    const lifeBonus = deaths === 0 ? 100 : 0;

    // Quiz bonus (first try = bonus)
    const quizBonus = quizAttempts === 1 ? 50 : 0;

    // Streak bonus
    const streakBonus = streak * 25;

    return {
        territoryScore,
        timeBonus,
        lifeBonus,
        quizBonus,
        streakBonus,
        totalScore: territoryScore + timeBonus + lifeBonus + quizBonus + streakBonus
    };
}
```

### Score Submission Flow
```
Frontend (QixScene)                    Backend
       │                                  │
       │  POST /leaderboard/score         │
       │  {sessionId, level, territory,   │
       │   time, deaths, pokemonId}       │
       │─────────────────────────────────>│
       │                                  │
       │                          Calculate score
       │                          Check achievements
       │                          Update rankings
       │                          Reveal Pokemon
       │                                  │
       │  {breakdown, rankings,           │
       │   achievements, pokemon}         │
       │<─────────────────────────────────│
       │                                  │
       │  Show score toast                │
       │  Trigger notifications           │
       └──────────────────────────────────┘
```

---

## Leaderboard System

### Leaderboard Types
- **All Time**: Total accumulated score
- **Weekly**: Scores from current week
- **Daily**: Scores from today

### API Response
```typescript
interface LeaderboardResponse {
    leaderboard: LeaderboardEntry[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
    };
}

interface LeaderboardEntry {
    rank: number;
    displayName: string;
    totalScore: number;
    highestLevel: number;
    bestStreak: number;
    gamesPlayed: number;
    isOnline: boolean;  // From WebSocket
}
```

### "Around Me" Feature
Shows player's position with nearby players:
```
#45  Player_A     12,500 pts
#46  Player_B     12,400 pts
#47  >>> YOU <<<  12,350 pts  ← Highlighted
#48  Player_C     12,300 pts
#49  Player_D     12,200 pts
```

---

## Achievement System

### Achievement Types
```typescript
const ACHIEVEMENTS = [
    // Score-based
    { id: 'first_score', name: 'First Steps', condition: 'score >= 100' },
    { id: 'score_1k', name: 'Point Collector', condition: 'score >= 1000' },
    { id: 'score_10k', name: 'Score Master', condition: 'score >= 10000' },

    // Level-based
    { id: 'level_5', name: 'Getting Started', condition: 'level >= 5' },
    { id: 'level_10', name: 'Dedicated Player', condition: 'level >= 10' },

    // Streak-based
    { id: 'streak_3', name: 'On Fire', condition: 'streak >= 3' },
    { id: 'streak_5', name: 'Unstoppable', condition: 'streak >= 5' },

    // Collection-based
    { id: 'pokemon_10', name: 'Collector', condition: 'pokemon >= 10' },
    { id: 'pokemon_50', name: 'Pokemon Master', condition: 'pokemon >= 50' },

    // Special
    { id: 'perfect_level', name: 'Perfectionist', condition: 'no_deaths && first_quiz' },
    { id: 'speed_demon', name: 'Speed Demon', condition: 'time < 30' },
];
```

### Achievement Check Flow
```
Score Submitted
      │
      ▼
Check all achievement conditions
      │
      ▼
For each newly unlocked:
  ├── Save to user_achievements table
  ├── Send WebSocket notification
  └── Return in API response
```

---

## WebSocket Integration

### Connection Flow
```
┌────────┐                              ┌────────┐
│ Client │                              │ Server │
└───┬────┘                              └───┬────┘
    │                                       │
    │  Connect to ws://localhost:3000/ws    │
    │──────────────────────────────────────>│
    │                                       │
    │  Send: {type: 'auth', token: JWT}     │
    │──────────────────────────────────────>│
    │                                       │
    │  Receive: {type: 'auth_success'}      │
    │<──────────────────────────────────────│
    │                                       │
    │  Subscribe: {type: 'subscribe',       │
    │              channel: 'leaderboard'}  │
    │──────────────────────────────────────>│
    │                                       │
    │       ... Real-time events ...        │
    │<─────────────────────────────────────>│
    └───────────────────────────────────────┘
```

### Event Types
```typescript
// Server -> Client Events
type WebSocketEvent =
    | { type: 'rank_change', data: { oldRank, newRank, change } }
    | { type: 'achievement_unlocked', data: { id, name, icon } }
    | { type: 'pokemon_revealed', data: { pokemon, collectionProgress } }
    | { type: 'streak_milestone', data: { streak, bonus } }
    | { type: 'leaderboard_update', data: { displayName, score, rank } }
    | { type: 'top_rank_change', data: { displayName, newRank } };
```

### Notification Display
```
┌─────────────────────────────┐
│ 🏆 Achievement Unlocked!    │
│ Point Collector             │
│ Score 1,000 points          │
└─────────────────────────────┘
         │
         │ Auto-dismiss after 5s
         ▼
```

---

## Database Schema

### Users
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Credentials (WebAuthn)
```sql
CREATE TABLE credentials (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    public_key TEXT NOT NULL,
    counter INTEGER DEFAULT 0,
    device_type TEXT,
    backed_up INTEGER DEFAULT 0,
    transports TEXT,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Scores
```sql
CREATE TABLE scores (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id TEXT,
    game_id TEXT,
    level INTEGER NOT NULL,
    score INTEGER NOT NULL,
    territory_percentage REAL,
    time_seconds INTEGER,
    deaths INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    pokemon_id INTEGER,
    pokemon_name TEXT,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### User Stats
```sql
CREATE TABLE user_stats (
    user_id TEXT PRIMARY KEY,
    total_score INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    highest_level INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    total_time_played INTEGER DEFAULT 0,
    total_deaths INTEGER DEFAULT 0,
    perfect_levels INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Pokemon Collection
```sql
CREATE TABLE pokemon_collection (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    pokemon_id INTEGER NOT NULL,
    pokemon_name TEXT,
    sprite_url TEXT,
    revealed_at DATETIME,
    UNIQUE(user_id, pokemon_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Achievements
```sql
CREATE TABLE user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    unlocked_at DATETIME,
    UNIQUE(user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/start` | Start passkey registration |
| POST | `/api/auth/register/complete` | Complete registration |
| POST | `/api/auth/login/start` | Start passkey login |
| POST | `/api/auth/login/complete` | Complete login |
| GET | `/api/auth/me` | Get current user |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard` | Get global leaderboard |
| GET | `/api/leaderboard/around-me` | Get rankings around player |
| POST | `/api/leaderboard/score` | Submit score |

### Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Get player stats |
| GET | `/api/stats/history` | Get game history |
| GET | `/api/stats/collection` | Get Pokemon collection |

### Achievements
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/achievements` | Get all achievements |
| GET | `/api/achievements/user` | Get user's achievements |

### Games
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/games` | List all games |
| GET | `/api/games/:id` | Get game details |
| POST | `/api/games` | Create new game |

---

## Development

### Start Services
```bash
./scripts/start.sh
# Backend: http://localhost:3000
# Frontend: http://localhost:3001
```

### Stop Services
```bash
./scripts/stop.sh
```

### Sync & Push Changes
```bash
./scripts/sync.sh
# Auto-generates commit messages
# Pushes frontend, backend, and parent repos
```

---

## File Structure

```
peekachoo/
├── peekachoo-frontend/
│   ├── src/
│   │   ├── scenes/
│   │   │   ├── login-scene.ts
│   │   │   ├── menu-scene.ts
│   │   │   ├── qix-scene.ts
│   │   │   ├── leaderboard-scene.ts
│   │   │   ├── stats-scene.ts
│   │   │   └── game-create-scene.ts
│   │   ├── services/
│   │   │   ├── auth-service.ts
│   │   │   ├── leaderboard-service.ts
│   │   │   ├── stats-service.ts
│   │   │   ├── websocket-service.ts
│   │   │   └── notification-manager.ts
│   │   ├── stores/
│   │   │   └── session-store.ts
│   │   ├── objects/
│   │   │   ├── player.ts
│   │   │   ├── grid.ts
│   │   │   ├── sparkies.ts
│   │   │   └── qixes.ts
│   │   └── main.ts
│   └── webpack.config.js
│
├── peekachoo-backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── leaderboardController.js
│   │   │   ├── statsController.js
│   │   │   └── achievementsController.js
│   │   ├── services/
│   │   │   ├── scoreService.js
│   │   │   └── websocketService.js
│   │   ├── routes/
│   │   │   └── index.js
│   │   ├── config/
│   │   │   ├── config.js
│   │   │   └── sqlite.js
│   │   └── server.js
│   └── data/
│       └── peekachoo.db
│
├── scripts/
│   ├── start.sh
│   ├── stop.sh
│   └── sync.sh
│
├── CLAUDE.md
└── GAME_ARCHITECTURE.md
```
