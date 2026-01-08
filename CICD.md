# CI/CD Pipeline Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Peekachoo project.

## Overview

The Peekachoo project uses GitHub Actions for CI/CD with a comprehensive pipeline covering:
- Code Quality (Linting, Type Checking)
- Unit Testing with Coverage
- End-to-End (E2E) Testing
- Security Scanning (SAST, DAST, Container Security)
- Automatic Deployment via Railway

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GitHub Actions Workflows                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  Admin Panel    │  │    Backend      │  │    Frontend     │             │
│  │  (Next.js)      │  │   (Express)     │  │   (Phaser 3)    │             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
│           │                    │                    │                       │
│  ┌────────▼────────────────────▼────────────────────▼────────┐             │
│  │                    Code Quality                            │             │
│  │  • Biome Linting    • TypeScript Check    • ESLint        │             │
│  └────────┬────────────────────┬────────────────────┬────────┘             │
│           │                    │                    │                       │
│  ┌────────▼────────────────────▼────────────────────▼────────┐             │
│  │                    Unit Testing                            │             │
│  │  • Jest Coverage    • Jest Coverage    • Jest Coverage    │             │
│  └────────┬────────────────────┬────────────────────┬────────┘             │
│           │                    │                    │                       │
│  ┌────────▼────────────────────▼────────────────────▼────────┐             │
│  │                    E2E Testing                             │             │
│  │  • Playwright       • Endpoint Tests   • Playwright       │             │
│  └────────┬────────────────────┬────────────────────┬────────┘             │
│           │                    │                    │                       │
│  ┌────────▼────────────────────▼────────────────────▼────────┐             │
│  │                   Security Scanning                        │             │
│  │  • Semgrep (SAST)  • Semgrep (SAST)   • Semgrep (SAST)   │             │
│  │  • Trivy (Docker)  • Trivy (Docker)   • Trivy (Docker)   │             │
│  │  • ZAP (DAST)      • Endpoint Sec     • ZAP (DAST)       │             │
│  └────────┬────────────────────┬────────────────────┬────────┘             │
│           │                    │                    │                       │
│  ┌────────▼────────────────────▼────────────────────▼────────┐             │
│  │                      Deployment                            │             │
│  │              Railway (Automatic on push to main)           │             │
│  └───────────────────────────────────────────────────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Workflows by Component

### Admin Panel (peekachoo-admin)

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| Lint | `admin-lint.yml` | Push/PR to main | Biome linting and formatting |
| Coverage | `admin-coverage.yml` | Push/PR to main | Jest unit tests with coverage |
| E2E | `admin-e2e.yml` | Push/PR to main | Playwright end-to-end tests |
| Semgrep | `admin-semgrep.yml` | Push/PR/Weekly | Static Application Security Testing |
| Trivy | `admin-trivy.yml` | Push/PR/Weekly | Docker container vulnerability scan |
| ZAP | `admin-zap.yml` | Manual/Weekly | OWASP ZAP dynamic security scan |

### Backend (peekachoo-backend)

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| Lint | `backend-lint.yml` | Push/PR to main | Biome linting and formatting |
| Coverage | `backend-coverage.yml` | Push/PR to main | Jest unit tests with coverage |
| Semgrep | `backend-semgrep.yml` | Push/PR/Weekly | Static Application Security Testing |
| Trivy | `backend-trivy.yml` | Push/PR/Weekly | Docker container vulnerability scan |
| Endpoint Security | `backend-endpoint-security.yml` | Push/PR to main | API endpoint authentication verification |

### Frontend (peekachoo-frontend)

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| Lint | `frontend-lint.yml` | Push/PR to main | TypeScript type checking |
| Coverage | `frontend-coverage.yml` | Push/PR to main | Jest unit tests with coverage |
| E2E | `frontend-e2e.yml` | Push/PR/Weekly | Playwright end-to-end tests |
| Semgrep | `frontend-semgrep.yml` | Push/PR/Weekly | Static Application Security Testing |
| Trivy | `frontend-trivy.yml` | Push/PR/Weekly | Docker container vulnerability scan |
| ZAP | `frontend-zap.yml` | Manual/Weekly | OWASP ZAP dynamic security scan |

## Pipeline Stages

### Stage 1: Code Quality

**Purpose:** Ensure code follows project standards and has no syntax errors.

```yaml
# Runs on every push and pull request
- Biome lint (Admin, Backend)
- TypeScript type check (Frontend)
- ESLint (where configured)
```

**Tools:**
- [Biome](https://biomejs.dev/) - Fast linter and formatter
- TypeScript compiler (`tsc --noEmit`)

### Stage 2: Unit Testing

**Purpose:** Verify individual components work correctly with code coverage reporting.

```yaml
# Runs on every push and pull request
- Jest test suite
- Coverage report generation
- Upload to Codecov (optional)
```

**Coverage Thresholds:**
- Statements: 70%
- Branches: 70%
- Functions: 70%
- Lines: 70%

### Stage 3: End-to-End Testing

**Purpose:** Test complete user flows in a real browser environment.

```yaml
# Runs on push/PR and weekly
- Playwright browser tests
- Screenshot on failure
- Video recording on failure
- HTML test report
```

**Test Scenarios:**
- Admin Panel: Login, dashboard, user management
- Frontend: Game loading, canvas rendering, responsiveness, authentication

### Stage 4: Security Scanning

#### Static Application Security Testing (SAST)

**Tool:** [Semgrep](https://semgrep.dev/)

```yaml
# Scans for:
- Security vulnerabilities
- Code quality issues
- React/Next.js anti-patterns
- Hardcoded secrets
```

**Rulesets:**
- `p/default` - General best practices
- `p/javascript` - JS-specific issues
- `p/typescript` - TS-specific issues
- `p/react` - React anti-patterns
- `p/nextjs` - Next.js security issues
- `p/security-audit` - Security vulnerabilities
- `p/secrets` - Hardcoded secrets detection

#### Container Security

**Tool:** [Trivy](https://trivy.dev/)

```yaml
# Scans Docker images for:
- OS vulnerabilities (Alpine packages)
- Library vulnerabilities (node_modules)
- Misconfigurations
```

**Severity Levels:** CRITICAL, HIGH (blocks pipeline)

#### Dynamic Application Security Testing (DAST)

**Tool:** [OWASP ZAP](https://www.zaproxy.org/)

```yaml
# Performs:
- Baseline scan (quick)
- Full scan (comprehensive)
- Authenticated scanning with JWT
- SARIF report for GitHub Security tab
```

### Stage 5: Deployment

**Platform:** [Railway](https://railway.app/)

```yaml
# Automatic deployment on push to main
- Admin Panel: https://peekachoo-admin-production.up.railway.app
- Backend API: https://peekachoo-backend-production.up.railway.app
- Frontend Game: https://peekachoo-frontend-production.up.railway.app
```

## GitHub Secrets Required

| Secret | Purpose | Used By |
|--------|---------|---------|
| `ADMIN_PASSWORD` | Admin panel login for E2E tests | admin-e2e, admin-zap |
| `TEST_JWT_TOKEN` | JWT for ZAP authenticated scanning | admin-zap, frontend-zap, backend-endpoint-security |
| `PLAYWRIGHT_TEST_JWT` | JWT for Playwright auth tests | frontend-e2e |
| `CODECOV_TOKEN` | Code coverage uploads | coverage workflows |
| `SEMGREP_APP_TOKEN` | Semgrep cloud integration (optional) | semgrep workflows |

## Scheduled Workflows

| Schedule | Workflows |
|----------|-----------|
| Weekly (Sunday midnight) | Trivy scans (all components) |
| Weekly (Sunday 1 AM) | Semgrep scans (all components) |
| Weekly (Sunday 3 AM) | Frontend E2E tests |
| Weekly (Sunday 4 AM) | ZAP security scans |

## Path-Based Triggers

Workflows only run when relevant files change:

```yaml
# Example: Admin lint only runs when admin files change
paths:
  - 'peekachoo-admin/**'
  - '.github/workflows/admin-lint.yml'
```

## Workflow Status Badges

Add these to your README.md:

```markdown
![Admin Lint](https://github.com/kenken64/peekachoo/actions/workflows/admin-lint.yml/badge.svg)
![Backend Lint](https://github.com/kenken64/peekachoo/actions/workflows/backend-lint.yml/badge.svg)
![Frontend Lint](https://github.com/kenken64/peekachoo/actions/workflows/frontend-lint.yml/badge.svg)
![Admin Trivy](https://github.com/kenken64/peekachoo/actions/workflows/admin-trivy.yml/badge.svg)
![Backend Trivy](https://github.com/kenken64/peekachoo/actions/workflows/backend-trivy.yml/badge.svg)
![Frontend E2E](https://github.com/kenken64/peekachoo/actions/workflows/frontend-e2e.yml/badge.svg)
```

## Running Workflows Locally

### Linting
```bash
# Admin
cd peekachoo-admin && npm run lint

# Backend
cd peekachoo-backend && npm run lint

# Frontend
cd peekachoo-frontend && npm run lint
```

### Unit Tests
```bash
# With coverage
npm run test:coverage
```

### E2E Tests
```bash
# Admin
cd peekachoo-admin && npm run test:e2e

# Frontend
cd peekachoo-frontend && npm run test:e2e

# With browser UI
npm run test:e2e:headed
```

### Security Scans
```bash
# Semgrep (requires installation)
semgrep scan --config "p/default" .

# Trivy (requires Docker)
docker build -t myapp:scan .
trivy image myapp:scan
```

## Troubleshooting

### Common Issues

1. **npm ci fails with ERESOLVE**
   - Use `--legacy-peer-deps` flag
   - Regenerate package-lock.json with `npm install`

2. **Playwright tests timeout**
   - Increase timeout in playwright.config.ts
   - Check if deployment is healthy

3. **Trivy finds vulnerabilities in npm packages**
   - Remove npm/yarn from production Docker image
   - Use multi-stage builds

4. **ZAP scan cannot reach target**
   - Verify deployment URL is correct
   - Check health endpoint is responding

### Viewing Workflow Logs

```bash
# List recent runs
gh run list --workflow=<workflow-name>.yml

# View specific run
gh run view <run-id> --log

# Download artifacts
gh run download <run-id>
```

## Contributing

When adding new workflows:
1. Follow the naming convention: `<component>-<purpose>.yml`
2. Add `workflow_dispatch` trigger for manual runs
3. Use path filters to avoid unnecessary runs
4. Add appropriate permissions (minimal required)
5. Upload artifacts for debugging
6. Update this documentation

## Security Considerations

- All secrets are stored in GitHub Secrets
- JWT tokens have 365-day expiry for testing
- Production deployments use separate secrets
- Security scan results upload to GitHub Security tab
- Container images remove unnecessary tools (npm, yarn) in production
