# Changelog

All notable fixes and changes to the Peekachoo project are documented in this file.

---

## [Unreleased]

### Fixed

#### Mermaid Diagram Rendering (356b39b)
**Date:** January 2026

**Problem:** Mermaid diagrams in `GAME_ARCHITECTURE.md` were causing lexical errors on GitHub due to special characters in route names.

**Solution:** Escaped forward slashes from route names that were causing Mermaid parsing errors.

**Files Changed:**
- `GAME_ARCHITECTURE.md`

---

#### Dockerfile Build Arguments (7a2d354)
**Date:** January 2026

**Problem:** Docker build arguments were not being properly passed as environment variables during the build process.

**Solution:** Changed ARG declarations to not have defaults and updated ENV syntax to use `${VAR}` format for proper variable interpolation.

**Before:**
```dockerfile
ARG SOME_VAR=default
ENV SOME_VAR=$SOME_VAR
```

**After:**
```dockerfile
ARG SOME_VAR
ENV SOME_VAR=${SOME_VAR}
```

**Files Changed:**
- `peekachoo-admin/Dockerfile`

---

#### API Response Format Transformation (d040cb9)
**Date:** January 2026

**Problem:** Backend API responses used camelCase field names, but the frontend expected snake_case format, causing data mapping issues.

**Solution:** Added response transformation layer to convert field names and map pagination properties correctly.

**Changes Made:**
- Convert camelCase fields back to snake_case for frontend compatibility
- Map `pagination.total` to `totalCount`
- Map `pagination.totalPages` to `totalPages`

**Files Changed:**
- `peekachoo-admin/src/lib/backendApi.ts`

---

## Features Added

### Next.js Admin Panel (2821b8b)
**Date:** January 2026

Added a complete admin panel for user management:
- Password-protected admin access via environment variable
- List all registered users with search functionality
- Pagination (30 records per page)
- Retro LED-style counter showing total users (auto-refresh)
- Delete users with cascade delete for related data
- Built with Next.js, Tailwind CSS

**Files Added:**
- `peekachoo-admin/` (new subproject)

---

### Railway Deployment Support (6af6969)
**Date:** January 2026

Added Docker support for Railway cloud deployment:
- Multi-stage Docker build for `peekachoo-admin`
- Configured Next.js standalone output mode
- Added `.dockerignore` for optimized builds
- Updated README with Railway deployment instructions

**Files Added:**
- `peekachoo-admin/Dockerfile`
- `peekachoo-admin/.dockerignore`

---

### Start/Stop Scripts (d1732e6)
**Date:** January 2026

Added convenience scripts for managing both frontend and backend services:

| Platform | Start | Stop |
|----------|-------|------|
| Windows (PowerShell) | `scripts/peekachoo.ps1` | `scripts/stop.ps1` |
| Linux/macOS | `scripts/peekachoo.sh` | `scripts/stop.sh` |

**Features:**
- Auto-install dependencies if missing
- Start both frontend and backend in parallel
- Graceful shutdown of all services

**Files Added:**
- `scripts/start.sh`
- `scripts/stop.sh`
- `scripts/start.ps1`
- `scripts/stop.ps1`

---

## Refactoring

### Admin Panel Architecture (ccc245f)
**Date:** January 2026

Refactored the admin panel to use backend API instead of direct database access:

**Before:**
- Direct SQLite database access using `better-sqlite3`
- Database file mounted in admin container

**After:**
- API calls to backend admin endpoints
- API key authentication for secure communication
- Cleaner separation of concerns

**Changes Made:**
- Removed direct SQLite database access
- Added `backendApi.ts` for calling backend admin endpoints
- Updated API routes to proxy requests to backend
- Removed `better-sqlite3` dependency
- Updated Dockerfile (removed SQLite dependencies)

---

## Documentation

### Game Architecture Documentation (018994c, 863b700, 18d8078)
**Date:** January 2026

Added comprehensive technical documentation:

- System overview with Mermaid diagrams
- Tech stack breakdown for frontend and backend
- Authentication flow (WebAuthn/Passkeys)
- Game mechanics explanation (Qix gameplay)
- Score calculation formulas
- Database ERD (Entity Relationship Diagram)
- API endpoint reference
- Frontend domain design documentation
- Sequence diagrams for key flows

**Files Added/Updated:**
- `GAME_ARCHITECTURE.md` (1700+ lines)

---

## Summary

| Type | Count |
|------|-------|
| Bug Fixes | 3 |
| New Features | 3 |
| Refactoring | 1 |
| Documentation | 3 |

---

## Contributors

- kenken64
- Claude (AI Assistant)

---

*This changelog follows [Keep a Changelog](https://keepachangelog.com/) format.*
