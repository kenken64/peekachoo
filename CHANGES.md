# Changelog

All notable fixes and changes to the Peekachoo project are documented in this file.

---

## Table of Contents

- [Parent Repository](#parent-repository)
- [Backend (peekachoo-backend)](#backend-peekachoo-backend)
- [Frontend (peekachoo-frontend)](#frontend-peekachoo-frontend)

---

## Parent Repository

### Fixed

#### Mermaid Diagram Rendering (356b39b)
**Problem:** Mermaid diagrams in `GAME_ARCHITECTURE.md` were causing lexical errors on GitHub due to special characters in route names.

**Solution:** Escaped forward slashes from route names that were causing Mermaid parsing errors.

---

#### Dockerfile Build Arguments (7a2d354)
**Problem:** Docker build arguments were not being properly passed as environment variables during the build process.

**Solution:** Changed ARG declarations to not have defaults and updated ENV syntax to use `${VAR}` format for proper variable interpolation.

---

#### API Response Format Transformation (d040cb9)
**Problem:** Backend API responses used camelCase field names, but the frontend expected snake_case format.

**Solution:** Added response transformation layer to convert field names and map pagination properties correctly.

---

### Features Added

#### Next.js Admin Panel (2821b8b)
- Password-protected admin access via environment variable
- List all registered users with search functionality
- Pagination (30 records per page)
- Retro LED-style counter showing total users (auto-refresh)
- Delete users with cascade delete for related data
- Built with Next.js, Tailwind CSS

#### Railway Deployment Support (6af6969)
- Multi-stage Docker build for `peekachoo-admin`
- Configured Next.js standalone output mode
- Added `.dockerignore` for optimized builds

#### Start/Stop Scripts (d1732e6)
| Platform | Start | Stop |
|----------|-------|------|
| Windows (PowerShell) | `scripts/peekachoo.ps1` | `scripts/stop.ps1` |
| Linux/macOS | `scripts/peekachoo.sh` | `scripts/stop.sh` |

---

### Documentation

#### Game Architecture Documentation (018994c, 863b700, 18d8078)
- System overview with Mermaid diagrams
- Tech stack breakdown for frontend and backend
- Authentication flow (WebAuthn/Passkeys)
- Game mechanics explanation (Qix gameplay)
- Score calculation formulas
- Database ERD (Entity Relationship Diagram)
- API endpoint reference
- Frontend domain design documentation

---

## Backend (peekachoo-backend)

### Fixed

| Commit | Description |
|--------|-------------|
| `7c8c474` | Format date for SQLite comparison in daily/weekly/monthly leaderboards |
| `caf14c4` | Use UTC for daily/weekly/monthly leaderboard date filters |
| `ba11171` | Fix peekachooService to remove MongoDB references |
| `b6d330c` | Fix Web Crypto API polyfill for @simplewebauthn/server |

---

### Security

| Commit | Description |
|--------|-------------|
| `f46490e` | Protect leaderboard, quiz, and peekachoo endpoints with JWT auth |
| `71699c3` | Add admin API endpoints with API key protection |

---

### Features Added

| Commit | Description |
|--------|-------------|
| `71699c3` | Add admin API endpoints with API key protection |
| `f8e3d7d` | Add debug endpoint to verify WebAuthn configuration |
| `5e1df00` | Add Docker support for Railway deployment |
| `82bf62c` | Add Railway deployment configuration and WebAuthn setup |
| `47d87fb` | Add sync all Pokemon functionality and quiz generation API |
| `7408010` | Add game and pokemon management features |
| `37412c8` | Add passkey authentication with SQLite and JWT |

---

### Refactoring

| Commit | Description |
|--------|-------------|
| `dd33e8b` | Remove MongoDB dependency and use SQLite exclusively |
| `adc6b37` | Remove SQLite database from version control |
| `416313b` | Restructure project following Express.js best practices |

---

### Documentation

| Commit | Description |
|--------|-------------|
| `82b5211` | Update README with comprehensive API documentation |
| `6d2b59a` | Add ADMIN_API_KEY to .env.example |

---

## Frontend (peekachoo-frontend)

### Fixed

| Commit | Description |
|--------|-------------|
| `1a0a567` | Virtual D-pad not working after collision/restart on mobile |
| `40926ef` | Improve leaderboard RANK column spacing |
| `e5470a5` | Add Authorization headers to leaderboard API calls |
| `962718f` | Mobile overlay positioning and replace D-pad with thumb joystick |
| `8fa61f2` | Position game canvas below header on mobile |
| `ebf28cd` | Separate mobile and desktop overlay positioning logic |
| `561c218` | Desktop version: revert content container style changes, simplify overlay positioning |
| `8f40802` | Mobile view: align image overlay with play area, fix player/line visibility, cleanup virtual dpad on logout |
| `7c08e55` | Improve mobile player visibility and virtual D-pad responsiveness |
| `6cf45d4` | Game screen overlapping with login screen after logout |
| `4200d92` | Center canvas vertically on mobile screens |
| `964b833` | Aggressively remove all borders and ensure full-width scaling |
| `21e3078` | Mobile scaling to fill full width and remove white borders |
| `1ed5738` | Remove white border on mobile and improve canvas positioning |
| `18ac810` | Mobile login form truncation and improve responsive scaling |
| `b6254b1` | TypeScript compatibility for Phaser 3.10 |
| `403a9b5` | Login error message visibility and env-config.js 404 |
| `191c682` | NES.css loading in development environment |
| `493f982` | Production asset paths for Railway deployment |

---

### Features Added

| Commit | Description |
|--------|-------------|
| `7b64a53` | Add mobile responsive support with virtual D-pad controls |
| `c52f886` | Add Railway deployment with Docker and runtime environment variables |
| `e35e717` | Enhance login screen with logo and improved Pikachu animations |
| `4ccc55f` | Add environment variables, sync all Pokemon, animated Pikachu login, and quiz service |

---

### Performance

| Commit | Description |
|--------|-------------|
| `0a6a9fa` | Optimize logo.png file size |

---

### Documentation

| Commit | Description |
|--------|-------------|
| `97ac676` | Update README with comprehensive documentation |

---

## Summary

| Component | Bug Fixes | Features | Security | Refactoring | Docs |
|-----------|-----------|----------|----------|-------------|------|
| Parent | 3 | 3 | - | 1 | 3 |
| Backend | 4 | 7 | 2 | 3 | 2 |
| Frontend | 18 | 4 | - | - | 1 |
| **Total** | **25** | **14** | **2** | **4** | **6** |

---

## Contributors

- kenken64
- Claude (AI Assistant)

---

*This changelog follows [Keep a Changelog](https://keepachangelog.com/) format.*
