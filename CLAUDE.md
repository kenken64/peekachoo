# Claude Code Rules for Peekachoo

## Critical Rules - NEVER Violate

### 1. File Protection - DO NOT DELETE
**NEVER delete the following files or directories:**

- **Database files:**
  - `*.db`
  - `*.sqlite`
  - `*.sqlite3`
  - Any file in `data/` directories
  - Any file containing "database" in the name

- **System/Config files:**
  - `.env`
  - `.env.*`
  - `package.json`
  - `package-lock.json`
  - `node_modules/` (do not delete entire directory)
  - `tsconfig.json`
  - `webpack.config.js`
  - `webpack.production.config.js`
  - `.gitignore`
  - `.git/`

- **Build outputs (ask before deleting):**
  - `dist/`
  - `build/`
  - `bundle.js`

**If you need to modify or recreate any of these files, ALWAYS ask for explicit permission first.**

### 2. Pre-Commit Requirements

Before creating any git commit, you MUST:

#### Frontend (peekachoo-frontend/)
```bash
# 1. Run TypeScript compilation check
cd peekachoo-frontend && npx tsc --noEmit

# 2. Build the frontend to ensure no build errors
cd peekachoo-frontend && npm run dev

# 3. Run linting (if eslint is configured)
cd peekachoo-frontend && npm run lint
```

#### Backend (peekachoo-backend/)
```bash
# 1. Run syntax check on all JS files
cd peekachoo-backend && node --check src/server.js

# 2. Verify the server can start (quick test)
cd peekachoo-backend && timeout 5 npm start || true
```

**If any of these commands fail, FIX the issues before committing.**

### 3. Code Quality Requirements

#### TypeScript (Frontend)
- All new code must be properly typed
- Avoid using `any` type unless absolutely necessary
- Run `npx tsc --noEmit` to check for type errors before committing

#### JavaScript (Backend)
- Use consistent code style
- Add JSDoc comments for functions
- Handle errors properly with try/catch
- Validate all user inputs

### 4. Testing Before Commit

When making significant changes:
1. Verify the backend starts without errors
2. Verify the frontend builds successfully
3. Test the affected functionality manually if possible

## Project Structure

```
Peekachoo/
├── peekachoo-frontend/    # Phaser 3 + TypeScript frontend
│   ├── src/
│   │   ├── scenes/        # Game scenes
│   │   ├── services/      # API services
│   │   ├── stores/        # State management
│   │   └── objects/       # Game objects
│   └── package.json
│
├── peekachoo-backend/     # Express.js backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── routes/        # API routes
│   │   ├── config/        # Configuration
│   │   └── middlewares/   # Express middleware
│   └── package.json
│
└── CLAUDE.md              # This file
```

## Commands Reference

### Frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Build for development |
| `npm run deploy` | Build for production |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type check without emit |

### Backend
| Command | Description |
|---------|-------------|
| `npm start` | Start the server |
| `npm run dev` | Start with file watching |

## Commit Message Format

Follow this format for commit messages:
```
<type>: <short description>

<optional body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`

## Before You Start

1. Always read relevant files before modifying them
2. Understand the existing code patterns
3. Follow the established conventions in the codebase
4. Ask for clarification if requirements are unclear

## Error Handling

If you encounter errors:
1. Read the full error message
2. Check the relevant source files
3. Fix the root cause, not just the symptoms
4. Verify the fix works before committing
