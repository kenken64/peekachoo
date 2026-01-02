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

## Frontend Domain Design (Beginner's Guide)

This section explains the TypeScript code architecture in the frontend. The code follows **Domain-Driven Design (DDD)** principles, where each file represents a real-world concept from the game.

### What is Domain-Driven Design?

Think of it like organizing a kitchen:
- **Domain Objects** = Kitchen tools (each has a specific purpose)
- **Scenes** = Different cooking stations (prep, cooking, plating)
- **Services** = Utility workers (delivery, cleanup)

The game code is organized the same way - each file handles ONE specific thing.

---

### Core Game Objects (`src/objects/`)

These are the "building blocks" of the game. Each class represents something you can see or interact with.

#### 🎮 Player (`player.ts`)
**What it is:** The character you control on screen (a colored circle).

**Key concepts:**
```
Player
├── position (x, y coordinates on screen)
├── speed (how fast it moves)
├── graphics (the visual circle you see)
└── movement tracking (where it was, where it's going)
```

**How it works:**
- Listens to keyboard arrow keys
- Updates position every frame
- Tracks if player is on a "safe" border or drawing a new line

```typescript
// Simplified concept:
class Player {
    x, y          // Current position
    speed         // Pixels moved per update
    previousPoint // Where player was last frame
    
    move(keys) {
        if (keys.left) x -= speed;
        if (keys.right) x += speed;
        // etc...
    }
}
```

---

#### 🟦 Grid (`grid.ts`)
**What it is:** The playing field - the rectangular area where the game happens.

**Key concepts:**
```
Grid
├── frame (the outer boundary rectangle)
├── filledPolygons (areas player has claimed)
├── currentLines (line player is currently drawing)
└── allPoints (tracking system for polygon calculations)
```

**How it works:**
1. Player moves along the border (safe)
2. Player ventures into unclaimed territory (drawing a line)
3. When player returns to a border, the line "closes" into a polygon
4. That polygon becomes claimed territory

**Real-world analogy:** Imagine drawing on a piece of paper. The frame is the paper's edge. When you draw a closed shape, that area is now "yours."

---

#### 👻 Sparky (`sparky.ts`) & Sparkies (`sparkies.ts`)
**What it is:** Enemy that patrols the borders. If it touches you on the border, you die.

**Key concepts:**
```
Sparky (single enemy)
├── position (x, y)
├── direction (UP, DOWN, LEFT, RIGHT)
├── speed (how fast it moves)
└── tick (controls animation timing)

Sparkies (collection manager)
├── sparkies[] (array of all active Sparkies)
├── startupTimes (when each one appears)
└── collision detection
```

**How it works:**
- Moves along borders and claimed territory edges
- At intersections, randomly picks a new direction
- Cannot go backwards (adds challenge)

**Real-world analogy:** Like a security guard patrolling the walls of a building, but it chooses random turns at corners.

---

#### 🌀 Qix (`qix.ts`) & Qixes (`qixes.ts`)
**What it is:** The main enemy that bounces around the unclaimed territory. If it touches your drawing line, you die.

**Key concepts:**
```
Qix (single enemy)
├── position (x, y)
├── directionDegrees (0-360, angle of movement)
├── speed (movement speed)
├── lines[] (visual "tail" effect - multiple colored lines)
└── collision detection

Qixes (collection manager)
├── qixes[] (array of all active Qixes)
├── startupTimes (when each appears)
└── collision detection
```

**How it works:**
- Moves in a direction (angle in degrees)
- Bounces off walls and claimed polygons
- Has a "tail" of colored lines for visual effect
- Checks if it's touching the player's current drawing line

**Real-world analogy:** Like a bouncy ball in a room. It bounces off walls but can't enter closed areas.

---

### Geometry Helper Classes ("Ext" = Extended)

These classes add extra functionality to Phaser's built-in geometry classes.

#### 📍 ExtPoint (`ext-point.ts`)
**What it is:** A point (x, y) with helper methods.

**Why it exists:** Phaser's `Point` class only stores coordinates. `ExtPoint` adds comparisons:

```typescript
// What ExtPoint adds:
point.isLeftOf(otherPoint)     // Is this point to the left?
point.isAboveOf(otherPoint)    // Is this point higher up?
point.equals(otherPoint)       // Are they the same spot?
point.isBetweenTwoPointsInclusive(p1, p2)  // Is it on a line between two points?
```

**Real-world analogy:** A map pin that can tell you "I'm north of you" or "I'm at the same location as that other pin."

---

#### 📐 ExtRectangle (`ext-rectangle.ts`)
**What it is:** A rectangle with collision detection.

**Why it exists:** The game frame needs to know:
- Is a point on my edge?
- Is a line crossing through me?
- Which side of me is this point on?

```typescript
// What ExtRectangle adds:
rect.pointOnTopSide(point)      // Is point touching top edge?
rect.pointOnOutline(point)      // Is point on ANY edge?
rect.collisionWithLine(line)    // Does this line cross my edges?
rect.pointOutside(point)        // Is point completely outside me?
```

---

#### 🔷 ExtPolygon (`ext-polygon.ts`)
**What it is:** A closed shape (polygon) with area calculation.

**Why it exists:** When player claims territory, we need:
- Calculate what percentage of the game area this polygon covers
- Check if points/enemies are inside it
- Draw it on screen

```typescript
// What ExtPolygon adds:
polygon.percentArea           // "This shape is 15.5% of the playing field"
polygon.outlineIntersects(point)  // Is point on the edge?
polygon.innerIntersects(point)    // Is point INSIDE the shape?
```

**The Math:** Uses a "ray casting" algorithm - draw a line from the point to the right edge. If it crosses an odd number of polygon edges, the point is inside.

---

#### 🎨 FilledPolygons (`filled-polygons.ts`)
**What it is:** Manager for all claimed territory polygons.

**What it does:**
```
FilledPolygons
├── polygons[] (all claimed shapes)
├── graphics (Phaser drawing object)
├── imageOverlay (reveals Pokemon image)
├── percentArea() → total % claimed
└── collision methods
```

**How territory claiming works:**
1. Player draws a closed loop
2. System calculates the new polygon
3. Polygon is added to `FilledPolygons`
4. `ImageOverlay` reveals that portion of the hidden Pokemon image

---

### Drawing & Lines

#### ✏️ CurrentLines (`current-lines.ts`)
**What it is:** Tracks the line player is currently drawing.

**Key concepts:**
```
CurrentLines
├── points[] (corner points of the line)
├── lines[] (line segments between points)
├── graphics (draws the line on screen)
```

**How it works:**
- Starts when player leaves a safe border
- Adds a new line segment on each 90° turn
- Resets when player returns to a border (line becomes a polygon)
- Resets if player dies (line disappears)

---

#### 📊 AllPoints (`all-points.ts`)
**What it is:** Calculates how to close a polygon when player returns to a border.

**The problem it solves:**
When you draw a line and return to the border, there are TWO possible polygons (one on each side of your line). This class:
1. Calculates both possible polygons
2. Picks the smaller one (game rule: you claim the smaller area)
3. Returns the polygon points in clockwise order

**Real-world analogy:** If you draw a line across a piece of paper, you've created two regions. This picks the smaller region.

---

### Visual Effects

#### 🖼️ ImageOverlay (`image-overlay.ts`)
**What it is:** Manages revealing the hidden Pokemon image as territory is claimed.

**How it works:**
```
ImageOverlay (Singleton pattern - only ONE exists)
├── canvas (HTML5 canvas separate from Phaser)
├── image (the Pokemon image to reveal)
├── polygons[] (claimed areas)
└── clipping (only show image through claimed polygons)
```

**The reveal effect:**
1. Pokemon image is hidden behind a mask
2. Each claimed polygon acts as a "window"
3. Canvas uses clipping to only show image through those windows
4. As you claim more territory, more image is revealed

---

### Game State & Flow

#### 📈 Levels (`levels.ts`)
**What it is:** Tracks level progression and difficulty scaling.

```typescript
Levels
├── currentLevel (1, 2, 3...)
├── coverageTarget (% needed to win)
└── nextLevel() → increases difficulty
```

**Difficulty scaling:**
- Each level: Qix moves faster (`qixSpeed++`)
- Each level: Qix updates more frequently (`qixTick--`)
- Higher levels may have more enemies

---

#### 🧭 Direction (`direction.ts`)
**What it is:** Simple enum for movement directions.

```typescript
enum Direction {
    UP = 1,
    DOWN,
    LEFT,
    RIGHT
}
```

**Why it's useful:** Instead of remembering "1 means up", code reads: `if (direction === Direction.UP)`

---

#### 💥 Collision (`collision.ts`)
**What it is:** Types of collisions with chainable checking.

```typescript
enum CollisionType {
    NONE,
    WITH_VERTICAL_LINE,
    WITH_HORIZONTAL_LINE
}

// Chainable collision checking:
Collision.NONE
    .or(() => checkWallCollision())
    .or(() => checkEnemyCollision())
```

**Why it's useful:** Clean way to check multiple collision types without nested if-statements.

---

### Scenes (`src/scenes/`)

Scenes are like "screens" or "pages" in the game. Each one handles a different game state.

| Scene | Purpose |
|-------|---------|
| `login-scene.ts` | User login with passkeys |
| `menu-scene.ts` | Main menu (play, leaderboard, stats) |
| `qix-scene.ts` | **Main gameplay** - where all the action happens |
| `leaderboard-scene.ts` | View high scores |
| `stats-scene.ts` | View your Pokemon collection |
| `game-create-scene.ts` | Create custom games |

#### QixScene - The Main Game Loop

```
QixScene Lifecycle:
1. init()    → Set up initial state
2. preload() → Load assets (images, sounds)
3. create()  → Create all game objects
4. update()  → Called 60x per second - game logic here!
```

**The update() loop (simplified):**
```typescript
update() {
    // 1. Move player based on input
    player.move(cursors);
    
    // 2. Update grid (check for closed polygons)
    grid.update(player);
    
    // 3. Move enemies
    sparkies.update();
    qixes.update();
    
    // 4. Check collisions
    if (sparkies.hitPlayer() || qixes.hitPlayerLine()) {
        playerDies();
    }
    
    // 5. Check win condition
    if (grid.percentClaimed >= 75) {
        levelComplete();
    }
    
    // 6. Update info display
    info.update();
}
```

---

### Design Patterns Used

| Pattern | Where | Why |
|---------|-------|-----|
| **Singleton** | `ImageOverlay` | Only one overlay should exist |
| **Decorator** | `ExtPoint`, `ExtPolygon` | Add methods to existing Phaser classes |
| **Composition** | `Grid` contains `FilledPolygons`, `CurrentLines` | Complex objects from simple ones |
| **Collection Manager** | `Sparkies` manages `Sparky[]` | Centralize multi-object logic |
| **State Machine** | Scene transitions | Clear game state management |

---

### Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         GAME LOOP (60 FPS)                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌───────┐    ┌────────────────┐                 │
│  │Keyboard │───>│Player │───>│CurrentLines    │                 │
│  │ Input   │    │ Move  │    │(drawing state) │                 │
│  └─────────┘    └───────┘    └───────┬────────┘                 │
│                                      │                           │
│                                      ▼                           │
│                              ┌───────────────┐                   │
│                              │ Line closed?  │                   │
│                              └───────┬───────┘                   │
│                                      │ YES                       │
│                                      ▼                           │
│                         ┌─────────────────────┐                  │
│                         │ AllPoints calculates│                  │
│                         │ new polygon         │                  │
│                         └──────────┬──────────┘                  │
│                                    │                             │
│                                    ▼                             │
│        ┌──────────────────────────────────────────────┐         │
│        │              FilledPolygons                   │         │
│        │  ┌─────────────┐     ┌─────────────────┐     │         │
│        │  │ Add polygon │────>│ ImageOverlay    │     │         │
│        │  │ to list     │     │ reveals image   │     │         │
│        │  └─────────────┘     └─────────────────┘     │         │
│        └──────────────────────────────────────────────┘         │
│                                    │                             │
│                                    ▼                             │
│                         ┌─────────────────────┐                  │
│                         │ Check: >= 75%?      │                  │
│                         └──────────┬──────────┘                  │
│                                    │ YES                         │
│                                    ▼                             │
│                         ┌─────────────────────┐                  │
│                         │ LEVEL COMPLETE!     │                  │
│                         │ Show Quiz, Submit   │                  │
│                         │ Score to Backend    │                  │
│                         └─────────────────────┘                  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    ENEMIES (parallel)                    │    │
│  │  ┌─────────┐                        ┌─────────┐         │    │
│  │  │Sparkies │── patrol borders ──>   │ Check   │         │    │
│  │  │         │                        │collision│         │    │
│  │  └─────────┘                        │ with    │──> DEATH│    │
│  │  ┌─────────┐                        │ player  │         │    │
│  │  │ Qixes   │── bounce in open ──>   │         │         │    │
│  │  └─────────┘                        └─────────┘         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

### Quick Reference: File → Purpose

| File | One-Line Description |
|------|---------------------|
| `player.ts` | User-controlled character movement |
| `grid.ts` | Playing field and territory tracking |
| `sparky.ts` | Single border-patrolling enemy |
| `sparkies.ts` | Manages all Sparky enemies |
| `qix.ts` | Single bouncing enemy |
| `qixes.ts` | Manages all Qix enemies |
| `ext-point.ts` | Point with comparison helpers |
| `ext-polygon.ts` | Polygon with area calculation |
| `ext-rectangle.ts` | Rectangle with collision detection |
| `filled-polygons.ts` | All claimed territory |
| `current-lines.ts` | Line being drawn right now |
| `all-points.ts` | Polygon closing calculations |
| `image-overlay.ts` | Pokemon image reveal effect |
| `levels.ts` | Level progression and difficulty |
| `direction.ts` | UP/DOWN/LEFT/RIGHT constants |
| `collision.ts` | Collision type handling |
| `info.ts` | HUD display (score, lives, %) |
| `debug.ts` | Developer debugging tools |
| `virtual-dpad.ts` | Mobile touch controls |

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
