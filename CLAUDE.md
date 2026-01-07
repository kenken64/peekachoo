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

#### Admin Panel (peekachoo-admin/)
```bash
# 1. Run Biome linter (MUST pass with 0 errors)
cd peekachoo-admin && npm run lint

# 2. Build to ensure no TypeScript/build errors
cd peekachoo-admin && npm run build
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

### 5. Biome Lint Rules (peekachoo-admin/)

The admin panel uses **Biome** for linting and formatting. Before committing, run:
```bash
cd peekachoo-admin && npm run lint
```

#### TypeScript Best Practices

**Use `unknown` instead of `any` in catch blocks:**
```typescript
// ❌ BAD
} catch (error: any) {
  return NextResponse.json({ error: error.message }, { status: 500 });
}

// ✅ GOOD
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json({ error: message }, { status: 500 });
}
```

**Use `import type` for type-only imports:**
```typescript
// ❌ BAD
import { NextRequest, NextResponse } from "next/server";

// ✅ GOOD (if NextRequest is only used as a type)
import { type NextRequest, NextResponse } from "next/server";
```

**Prefix unused parameters with underscore:**
```typescript
// ❌ BAD
export async function POST(request: NextRequest) {
  // request is not used
}

// ✅ GOOD
export async function POST(_request: NextRequest) {
  // explicitly marked as unused
}
```

#### React/JSX Best Practices

**Always add `type="button"` to non-submit buttons:**
```tsx
// ❌ BAD
<button onClick={handleClick}>Click me</button>

// ✅ GOOD
<button type="button" onClick={handleClick}>Click me</button>
```

**Use unique keys without array index:**
```tsx
// ❌ BAD
{items.map((item, index) => (
  <div key={index}>{item.name}</div>
))}

// ✅ GOOD - use unique ID
{items.map((item) => (
  <div key={item.id}>{item.name}</div>
))}

// ✅ GOOD - if no ID, create objects with unique keys
const getItems = () => {
  return items.map((item, i) => ({ id: `item-${item.name}-${i}`, value: item }));
};
{getItems().map((item) => (
  <div key={item.id}>{item.value.name}</div>
))}
```

**Label elements must have `htmlFor` attribute:**
```tsx
// ❌ BAD
<label>Username:</label>
<input type="text" />

// ✅ GOOD
<label htmlFor="username">Username:</label>
<input id="username" type="text" />
```

#### Modal/Dialog Accessibility

**Modal backdrops should have keyboard handlers:**
```tsx
// ✅ GOOD - Modal pattern
{isOpen && (
  <div
    className="fixed inset-0 bg-black/70"
    onClick={closeModal}
    onKeyDown={(e) => e.key === "Escape" && closeModal()}
    role="presentation"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.key === "Escape" && closeModal()}
      role="dialog"
      aria-modal="true"
    >
      {/* Modal content */}
    </div>
  </div>
)}
```

#### Formatting Rules

Biome enforces these formatting rules (configured in `biome.json`):
- **Indentation:** Tabs
- **Quotes:** Double quotes for strings
- **Semicolons:** Required

Run `npm run format` to auto-fix formatting issues.

#### Quick Reference - Common Biome Errors

| Error | Fix |
|-------|-----|
| `noExplicitAny` | Use `unknown` and type check with `instanceof` |
| `useImportType` | Add `type` keyword to type-only imports |
| `noUnusedFunctionParameters` | Prefix with `_` or remove |
| `useButtonType` | Add `type="button"` to non-submit buttons |
| `noArrayIndexKey` | Use unique IDs for React keys |
| `noLabelWithoutControl` | Add `htmlFor` to labels with matching `id` on inputs |
| `useKeyWithClickEvents` | Add `onKeyDown` handler alongside `onClick` |

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
├── peekachoo-admin/       # Next.js admin panel
│   ├── src/
│   │   ├── app/           # Next.js App Router pages & API routes
│   │   ├── components/    # UI components
│   │   └── lib/           # Utilities & backend API client
│   ├── biome.json         # Biome linter configuration
│   └── package.json
│
└── CLAUDE.md              # This file
```

## Commands Reference

### Frontend (peekachoo-frontend/)
| Command | Description |
|---------|-------------|
| `npm run dev` | Build for development |
| `npm run deploy` | Build for production |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type check without emit |

### Backend (peekachoo-backend/)
| Command | Description |
|---------|-------------|
| `npm start` | Start the server |
| `npm run dev` | Start with file watching |

### Admin Panel (peekachoo-admin/)
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run Biome linter |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format code with Biome |

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
