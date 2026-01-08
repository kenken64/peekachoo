# Peekachoo Testing and Security Fixes

**Project:** Peekachoo
**Branch:** security-fixes (from main)
**Generated:** 2026-01-08
**Last Verified:** 2026-01-08
**Overall Progress:** 3%

---

## Verification Status

> **Last verification performed:** 2026-01-08
> **Verified by:** Automated codebase scan

### Current Implementation Status

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Backend Dockerfile | `peekachoo-backend/Dockerfile` | NOT FIXED | Uses `node:18-alpine`, no `apk upgrade` |
| Admin next.config | `peekachoo-admin/next.config.ts` | NOT FIXED | No security headers configured |
| Admin Dockerfile | `peekachoo-admin/Dockerfile` | PARTIAL | Uses `node:20-alpine`, removes npm/yarn |
| Frontend nginx.conf | `peekachoo-frontend/nginx.conf` | PARTIAL | Has X-Content-Type-Options only |
| Frontend Dockerfile | `peekachoo-frontend/Dockerfile` | NOT FIXED | Uses `node:18-alpine` and `nginx:alpine` |
| Frontend index.html | `peekachoo-frontend/index.html` | NOT FIXED | No SRI on external scripts |

---

## Executive Summary

This document outlines the remediation plan for security vulnerabilities and testing improvements identified from automated scans. The plan is organized into 4 phases with specific, actionable tasks.

| Category | Total Issues | Critical | High | Medium | Low | Info |
|----------|-------------|----------|------|--------|-----|------|
| Trivy Container CVEs | 12 | 0 | 0 | 8 | 4 | 0 |
| OWASP ZAP (Admin) | 9 | 0 | 0 | 2 | 5 | 2 |
| OWASP ZAP (Frontend) | 19 | 0 | 0 | 3 | 6 | 10 |
| **Total** | **40** | **0** | **0** | **13** | **15** | **12** |

---

## Current Test Coverage Status

### Admin Panel (peekachoo-admin)
| Metric | Coverage |
|--------|----------|
| Statements | 100% |
| Branches | 96.55% |
| Functions | 100% |
| Lines | 100% |

### Frontend (peekachoo-frontend)
| Metric | Coverage |
|--------|----------|
| Statements | 100% |
| Branches | 100% |
| Functions | 100% |
| Lines | 100% |

### E2E Test Results

| Test Suite | Tests | Passed | Failed | Status |
|------------|-------|--------|--------|--------|
| Admin E2E Tests | 21 | 21 | 0 | PASS |
| Frontend E2E Tests | 12 | 12 | 0 | PASS |

---

## Phase 1: Critical Container Vulnerabilities (Trivy CVEs)
**Priority:** HIGH
**Target:** Backend Docker Container
**Progress:** 0%

These vulnerabilities exist in the base Alpine Linux image used for the backend container. All require updating the base image or specific packages.

### Verified Current State
```dockerfile
# peekachoo-backend/Dockerfile (line 3)
FROM node:18-alpine  # VULNERABLE - needs update to node:22-alpine3.21
```

### 1.1 BusyBox Package Vulnerabilities

| Task ID | CVE | Package | Current Version | Fixed Version | Severity | Status |
|---------|-----|---------|-----------------|---------------|----------|--------|
| T1.1.1 | CVE-2024-58251 | busybox | 1.37.0-r12 | 1.37.0-r14 | MEDIUM | [ ] Pending |
| T1.1.2 | CVE-2025-46394 | busybox | 1.37.0-r12 | 1.37.0-r14 | LOW | [ ] Pending |
| T1.1.3 | CVE-2024-58251 | busybox-binsh | 1.37.0-r12 | 1.37.0-r14 | MEDIUM | [ ] Pending |
| T1.1.4 | CVE-2025-46394 | busybox-binsh | 1.37.0-r12 | 1.37.0-r14 | LOW | [ ] Pending |
| T1.1.5 | CVE-2024-58251 | ssl_client | 1.37.0-r12 | 1.37.0-r14 | MEDIUM | [ ] Pending |
| T1.1.6 | CVE-2025-46394 | ssl_client | 1.37.0-r12 | 1.37.0-r14 | LOW | [ ] Pending |

#### Remediation Steps for BusyBox:
```dockerfile
# In peekachoo-backend/Dockerfile
# Update the base image to latest Alpine with fixed busybox
FROM node:22-alpine3.21

# Or explicitly update busybox packages
RUN apk update && apk upgrade busybox busybox-binsh ssl_client
```

### 1.2 OpenSSL Package Vulnerabilities

| Task ID | CVE | Package | Current Version | Fixed Version | Severity | Status |
|---------|-----|---------|-----------------|---------------|----------|--------|
| T1.2.1 | CVE-2025-9230 | libcrypto3 | 3.3.3-r0 | 3.3.5-r0 | MEDIUM | [ ] Pending |
| T1.2.2 | CVE-2025-9231 | libcrypto3 | 3.3.3-r0 | 3.3.5-r0 | MEDIUM | [ ] Pending |
| T1.2.3 | CVE-2025-9232 | libcrypto3 | 3.3.3-r0 | 3.3.5-r0 | LOW | [ ] Pending |
| T1.2.4 | CVE-2025-9230 | libssl3 | 3.3.3-r0 | 3.3.5-r0 | MEDIUM | [ ] Pending |
| T1.2.5 | CVE-2025-9231 | libssl3 | 3.3.3-r0 | 3.3.5-r0 | MEDIUM | [ ] Pending |
| T1.2.6 | CVE-2025-9232 | libssl3 | 3.3.3-r0 | 3.3.5-r0 | LOW | [ ] Pending |

#### Remediation Steps for OpenSSL:
```dockerfile
# In peekachoo-backend/Dockerfile
# Update OpenSSL packages to fixed versions
RUN apk update && apk upgrade libcrypto3 libssl3

# Or use a base image with updated OpenSSL
FROM node:22-alpine3.21
```

### 1.3 Consolidated Docker Image Update Task

**Task T1.3.1: Update Backend Dockerfile Base Image**

```dockerfile
# peekachoo-backend/Dockerfile - RECOMMENDED CHANGES

# Option 1: Update to latest Alpine base (preferred)
FROM node:22-alpine3.21

# Option 2: Add explicit package updates after FROM
RUN apk update && \
    apk upgrade --no-cache \
    busybox \
    busybox-binsh \
    ssl_client \
    libcrypto3 \
    libssl3 && \
    rm -rf /var/cache/apk/*
```

| Subtask | Description | Status |
|---------|-------------|--------|
| T1.3.1a | Update FROM instruction to node:22-alpine3.21 or later | [ ] Pending |
| T1.3.1b | Add apk upgrade command for vulnerable packages | [ ] Pending |
| T1.3.1c | Rebuild Docker image locally and verify | [ ] Pending |
| T1.3.1d | Run Trivy scan to confirm fixes | [ ] Pending |
| T1.3.1e | Push updated image to container registry | [ ] Pending |

---

## Phase 2: HTTP Security Headers (Admin Panel)
**Priority:** MEDIUM
**Target:** peekachoo-admin (Next.js)
**Progress:** 0%

### Verified Current State
```typescript
// peekachoo-admin/next.config.ts - CURRENT (NO SECURITY HEADERS)
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### 2.1 Content Security Policy (CSP) Header

| Task ID | Issue | Rule ID | Severity | Status |
|---------|-------|---------|----------|--------|
| T2.1.1 | Content Security Policy (CSP) Header Not Set | 10038 | MEDIUM | [ ] Pending |

#### Remediation Steps:
```typescript
// peekachoo-admin/next.config.js or next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://peekachoo-backend-production.up.railway.app",
      "frame-ancestors 'none'",
    ].join('; ')
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 2.2 Anti-Clickjacking Header

| Task ID | Issue | Rule ID | Severity | Status |
|---------|-------|---------|----------|--------|
| T2.2.1 | Missing Anti-clickjacking Header | 10020 | MEDIUM | [ ] Pending |

#### Remediation Steps:
```typescript
// Add to securityHeaders array in next.config.js
{
  key: 'X-Frame-Options',
  value: 'DENY'
}
```

### 2.3 Site Isolation Headers (Spectre Protection)

| Task ID | Issue | Rule ID | Severity | Status |
|---------|-------|---------|----------|--------|
| T2.3.1 | Cross-Origin-Resource-Policy not set | 90004 | LOW | [ ] Pending |
| T2.3.2 | Cross-Origin-Embedder-Policy not set | 90004 | LOW | [ ] Pending |
| T2.3.3 | Cross-Origin-Opener-Policy not set | 90004 | LOW | [ ] Pending |

#### Remediation Steps:
```typescript
// Add to securityHeaders array
{
  key: 'Cross-Origin-Resource-Policy',
  value: 'same-origin'
},
{
  key: 'Cross-Origin-Embedder-Policy',
  value: 'require-corp'
},
{
  key: 'Cross-Origin-Opener-Policy',
  value: 'same-origin'
}
```

### 2.4 Additional Security Headers

| Task ID | Issue | Rule ID | Severity | Status |
|---------|-------|---------|----------|--------|
| T2.4.1 | Permissions Policy Header Not Set | 10063 | LOW | [ ] Pending |
| T2.4.2 | X-Powered-By header exposes Next.js | 10037 | LOW | [ ] Pending |
| T2.4.3 | Strict-Transport-Security Header Not Set | 10035 | LOW | [ ] Pending |
| T2.4.4 | X-Content-Type-Options Header Missing | 10021 | LOW | [ ] Pending |

#### Remediation Steps:
```typescript
// Complete security headers configuration for next.config.ts
import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://peekachoo-backend-production.up.railway.app; frame-ancestors 'none'"
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-origin'
  },
  {
    key: 'Cross-Origin-Embedder-Policy',
    value: 'require-corp'
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin'
  }
];

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

---

## Phase 3: HTTP Security Headers (Frontend)
**Priority:** MEDIUM
**Target:** peekachoo-frontend (Static/Nginx)
**Progress:** 11%

### Verified Current State
```nginx
# peekachoo-frontend/nginx.conf - CURRENT (PARTIAL HEADERS)
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # ... gzip and cache config ...

    # Security headers - PARTIALLY IMPLEMENTED
    add_header X-Frame-Options "SAMEORIGIN" always;      # Should be "DENY"
    add_header X-Content-Type-Options "nosniff" always;  # [x] DONE
    add_header X-XSS-Protection "1; mode=block" always;  # Deprecated but present

    # MISSING: CSP, HSTS, Permissions-Policy, CORP/COEP/COOP, server_tokens off
}
```

### 3.1 Content Security Policy

| Task ID | Issue | Rule ID | Severity | Status |
|---------|-------|---------|----------|--------|
| T3.1.1 | Content Security Policy (CSP) Header Not Set | 10038 | MEDIUM | [ ] Pending |

### 3.2 Anti-Clickjacking Header

| Task ID | Issue | Rule ID | Severity | Status |
|---------|-------|---------|----------|--------|
| T3.2.1 | Missing Anti-clickjacking Header (should be DENY) | 10020 | MEDIUM | [ ] Pending |

### 3.3 Subresource Integrity (SRI)

| Task ID | Issue | Rule ID | Severity | Status |
|---------|-------|---------|----------|--------|
| T3.3.1 | Sub Resource Integrity Attribute Missing (Google Fonts) | 90003 | MEDIUM | [ ] Pending |
| T3.3.2 | Sub Resource Integrity Attribute Missing (Razorpay) | 90003 | MEDIUM | [ ] Pending |

### Verified Current State (index.html)
```html
<!-- peekachoo-frontend/index.html - NO SRI ATTRIBUTES -->
<link href="https://fonts.googleapis.com/css?family=Press+Start+2P" rel="stylesheet">
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<!-- Both missing integrity="" and crossorigin="anonymous" attributes -->
```

#### Remediation Steps:
```html
<!-- In index.html, add integrity attributes to external resources -->
<!-- For Google Fonts - host locally instead or use preconnect -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- For Razorpay - add SRI hash (get from Razorpay documentation) -->
<script
  src="https://checkout.razorpay.com/v1/checkout.js"
  integrity="sha384-HASH_FROM_RAZORPAY"
  crossorigin="anonymous">
</script>
```

### 3.4 Server Information Disclosure

| Task ID | Issue | Rule ID | Severity | Status |
|---------|-------|---------|----------|--------|
| T3.4.1 | In Page Banner Information Leak (nginx/1.29.4) | 10009 | LOW | [ ] Pending |
| T3.4.2 | Cross-Domain JavaScript Source File Inclusion | 10017 | LOW | [ ] Pending |

#### Remediation Steps (Nginx Configuration):
```nginx
# In nginx.conf or site configuration
server_tokens off;

# Add security headers
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://peekachoo-backend-production.up.railway.app wss://peekachoo-backend-production.up.railway.app; frame-ancestors 'none'" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Cross-Origin-Resource-Policy "same-origin" always;
add_header Cross-Origin-Embedder-Policy "require-corp" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;
```

### 3.5 Additional Frontend Security Headers

| Task ID | Issue | Rule ID | Severity | Status |
|---------|-------|---------|----------|--------|
| T3.5.1 | Permissions Policy Header Not Set | 10063 | LOW | [ ] Pending |
| T3.5.2 | Strict-Transport-Security Header Not Set | 10035 | LOW | [ ] Pending |
| T3.5.3 | X-Content-Type-Options Header Missing | 10021 | LOW | [x] **DONE** |
| T3.5.4 | Insufficient Site Isolation (CORP/COEP/COOP) | 90004 | LOW | [ ] Pending |

---

## Phase 4: Informational Issues & Best Practices
**Priority:** LOW
**Progress:** 0%

### 4.1 Cache Control Improvements

| Task ID | Issue | Rule ID | Status |
|---------|-------|---------|--------|
| T4.1.1 | Re-examine Cache-control Directives | 10015 | [ ] Pending |
| T4.1.2 | Storable and Cacheable Content review | 10049 | [ ] Pending |

#### Remediation:
```nginx
# For static assets (CSS, JS, images)
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
}

# For HTML files
location ~* \.html$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### 4.2 Sec-Fetch Headers (Informational)

| Task ID | Issue | Rule ID | Status |
|---------|-------|---------|--------|
| T4.2.1 | Sec-Fetch-Dest Header is Missing | 90005 | [ ] Review |
| T4.2.2 | Sec-Fetch-Mode Header is Missing | 90005 | [ ] Review |
| T4.2.3 | Sec-Fetch-Site Header is Missing | 90005 | [ ] Review |
| T4.2.4 | Sec-Fetch-User Header is Missing | 90005 | [ ] Review |

**Note:** Sec-Fetch-* headers are request headers sent by browsers, not response headers. These are informational only and indicate the scanner is checking for their presence in requests.

### 4.3 Base64 Disclosure Review

| Task ID | Issue | Rule ID | Status |
|---------|-------|---------|--------|
| T4.3.1 | Review Base64 encoded content for sensitive data | 10094 | [ ] Review |

**Note:** Base64 disclosures appear to be CSS class names (geist font module) and embedded assets (WAV/PNG). Low risk but should be verified manually.

### 4.4 Comment Review

| Task ID | Issue | Rule ID | Status |
|---------|-------|---------|--------|
| T4.4.1 | Review suspicious comments in bundle.js | 10027 | [ ] Review |

**Note:** False positive - detected pattern matches are in minified code, not actual comments.

---

## Implementation Checklist

### Phase 1: Container Vulnerabilities
- [ ] T1.3.1a: Update Backend Dockerfile FROM instruction (`node:18-alpine` -> `node:22-alpine3.21`)
- [ ] T1.3.1b: Add apk upgrade for vulnerable packages
- [ ] T1.3.1c: Rebuild and test Docker image locally
- [ ] T1.3.1d: Run Trivy scan to verify fixes
- [ ] T1.3.1e: Deploy updated container

### Phase 2: Admin Panel Security Headers
- [ ] T2.1.1: Add CSP header to next.config.ts
- [ ] T2.2.1: Add X-Frame-Options header
- [ ] T2.3.1-3: Add Cross-Origin-* headers
- [ ] T2.4.1: Add Permissions-Policy header
- [ ] T2.4.2: Disable X-Powered-By header (`poweredByHeader: false`)
- [ ] T2.4.3: Add HSTS header
- [ ] T2.4.4: Add X-Content-Type-Options header
- [ ] Verify all headers with ZAP rescan

### Phase 3: Frontend Security Headers
- [ ] T3.1.1: Configure CSP in Nginx
- [ ] T3.2.1: Change X-Frame-Options from "SAMEORIGIN" to "DENY"
- [ ] T3.3.1-2: Add SRI to external scripts (or host locally)
- [ ] T3.4.1: Add `server_tokens off;` to Nginx config
- [ ] T3.5.1: Add Permissions-Policy header
- [ ] T3.5.2: Add HSTS header
- [x] T3.5.3: X-Content-Type-Options header **ALREADY SET**
- [ ] T3.5.4: Add Cross-Origin-* headers
- [ ] Verify all headers with ZAP rescan

### Phase 4: Informational Items
- [ ] T4.1.1-2: Review and optimize cache headers
- [ ] T4.2.1-4: Document Sec-Fetch header behavior (informational only)
- [ ] T4.3.1: Manual review of Base64 content
- [ ] T4.4.1: Review minified code comments (likely false positive)

---

## Progress Tracking

| Phase | Total Tasks | Completed | Percentage |
|-------|-------------|-----------|------------|
| Phase 1: Container CVEs | 6 | 0 | 0% |
| Phase 2: Admin Headers | 8 | 0 | 0% |
| Phase 3: Frontend Headers | 9 | 1 | 11% |
| Phase 4: Informational | 8 | 0 | 0% |
| **Overall** | **31** | **1** | **3%** |

---

## Pending Tasks Summary

### HIGH Priority (Phase 1 - Container CVEs)
1. **T1.3.1a**: Update `peekachoo-backend/Dockerfile` FROM `node:18-alpine` to `node:22-alpine3.21`
2. **T1.3.1b**: Add `RUN apk update && apk upgrade busybox busybox-binsh ssl_client libcrypto3 libssl3`
3. **T1.3.1c-e**: Rebuild, verify with Trivy, and deploy

### MEDIUM Priority (Phase 2 - Admin Panel)
4. **T2.1.1-T2.4.4**: Add complete security headers to `peekachoo-admin/next.config.ts`
5. Add `poweredByHeader: false` to Next.js config

### MEDIUM Priority (Phase 3 - Frontend)
6. **T3.1.1**: Add CSP header to `peekachoo-frontend/nginx.conf`
7. **T3.2.1**: Change X-Frame-Options from "SAMEORIGIN" to "DENY"
8. **T3.3.1-2**: Add SRI attributes to Google Fonts and Razorpay scripts in `index.html`
9. **T3.4.1**: Add `server_tokens off;` to nginx.conf
10. **T3.5.1-2,4**: Add HSTS, Permissions-Policy, and Cross-Origin headers

### LOW Priority (Phase 4 - Review)
11. Review cache control directives
12. Verify Base64 disclosures are benign
13. Confirm comment detection is false positive

---

## Verification Commands

### Trivy Container Scan
```bash
# Scan the backend container for vulnerabilities
trivy image peekachoo-backend:latest

# Scan with JSON output for CI/CD
trivy image --format json --output trivy-results.json peekachoo-backend:latest
```

### Security Header Verification
```bash
# Check response headers
curl -I https://peekachoo-admin-production.up.railway.app
curl -I https://peekachoo-frontend-production.up.railway.app

# Or use securityheaders.com for detailed analysis
```

### OWASP ZAP Baseline Scan
```bash
# Run ZAP baseline scan
docker run -t zaproxy/zap-stable zap-baseline.py \
  -t https://peekachoo-admin-production.up.railway.app
```

---

## CVE Reference Links

| CVE ID | Description | Reference |
|--------|-------------|-----------|
| CVE-2024-58251 | BusyBox vulnerability | [NVD](https://avd.aquasec.com/nvd/cve-2024-58251) |
| CVE-2025-46394 | BusyBox vulnerability | [NVD](https://avd.aquasec.com/nvd/cve-2025-46394) |
| CVE-2025-9230 | OpenSSL vulnerability | [NVD](https://avd.aquasec.com/nvd/cve-2025-9230) |
| CVE-2025-9231 | OpenSSL vulnerability | [NVD](https://avd.aquasec.com/nvd/cve-2025-9231) |
| CVE-2025-9232 | OpenSSL vulnerability | [NVD](https://avd.aquasec.com/nvd/cve-2025-9232) |

---

## Notes

1. **Container Updates**: All Trivy CVEs can be resolved by updating the Alpine base image and running `apk upgrade`. This is a single remediation action that fixes multiple CVEs.

2. **Security Headers**: Both Admin (Next.js) and Frontend (Nginx) require similar security headers but different implementation approaches.

3. **SRI for External Scripts**: The Razorpay checkout script should either have SRI added or be proxied through your own server for complete control.

4. **HSTS Preload**: After adding HSTS header, consider submitting to the [HSTS Preload List](https://hstspreload.org/) for maximum protection.

5. **Testing**: All E2E tests are passing. No test-related fixes are required at this time.

6. **Partial Implementation Found**: The frontend nginx.conf already has `X-Content-Type-Options: nosniff` configured, which addresses one of the security header requirements.
