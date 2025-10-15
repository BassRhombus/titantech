# Threat Model - TitanTech Hub

## Executive Summary

This document identifies security threats to TitanTech Hub and documents mitigations implemented in the security baseline. The primary concern is **client-side tampering** (Fiddler/MITM attacks) leading to privilege escalation and unauthorized access.

## Assets

### Critical Assets
1. **User Sessions** - Authentication state and admin privileges
2. **User Data** - Commission requests, showcase submissions, personal information
3. **Admin Functions** - Server management, content moderation, user administration
4. **File Uploads** - User-submitted images and files
5. **API Keys & Secrets** - Session secrets, Discord webhooks, GSH API tokens

### Asset Criticality
- **HIGH**: Admin sessions, session secrets, API tokens
- **MEDIUM**: User data, uploaded files
- **LOW**: Public content, cached data

## Trust Boundaries

```
┌─────────────────────────────────────────────────────────┐
│                    UNTRUSTED ZONE                        │
│  ┌──────────────┐     ┌──────────────┐                 │
│  │   Browser    │────▶│   Fiddler    │                 │
│  │   Client     │◀────│   MITM Proxy │                 │
│  └──────────────┘     └──────────────┘                 │
│         │                     │                          │
└─────────┼─────────────────────┼──────────────────────────┘
          │                     │
          ▼ HTTPS (can be intercepted)
┌─────────────────────────────────────────────────────────┐
│                    TRUST BOUNDARY                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Express Server (Node.js)                │  │
│  │  ┌──────────────────────────────────────────┐    │  │
│  │  │  Security Baseline Modules               │    │  │
│  │  │  - serverAuth.js (session verification) │    │  │
│  │  │  - requireAuth.js (auth guards)          │    │  │
│  │  │  - validation.js (input validation)      │    │  │
│  │  └──────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────┘  │
│                    TRUSTED ZONE                          │
└─────────────────────────────────────────────────────────┘
```

## Threat Categories (STRIDE Analysis)

### S - Spoofing

| Threat | Attack Vector | Likelihood | Impact | Mitigation |
|--------|---------------|------------|--------|------------|
| Admin Impersonation | Tamper `/api/user` response to set `admin:true` | HIGH | CRITICAL | Server-side session verification in `requireAdmin` middleware |
| Session Forgery | Forge session cookie | MEDIUM | HIGH | Cryptographically strong `SESSION_SECRET` (64+ chars) |
| User Impersonation | Steal/replay session cookies | MEDIUM | HIGH | HTTP-only, Secure, SameSite=Strict cookies |

**Controls Implemented:**
- ✅ `requireAuth` and `requireAdmin` middleware verify session server-side
- ✅ Strong session secret (environment variable)
- ✅ Secure cookie flags (HTTP-only, Secure, SameSite)
- ✅ Session regeneration on login

### T - Tampering

| Threat | Attack Vector | Likelihood | Impact | Mitigation |
|--------|---------------|------------|--------|------------|
| Client-Side Auth Bypass | Modify JavaScript to skip auth checks | HIGH | CRITICAL | Server-side enforcement on ALL protected routes |
| Request Parameter Tampering | Modify POST/PUT payloads | HIGH | MEDIUM | Zod schema validation on all inputs |
| File Content Tampering | Upload malicious files with fake MIME types | MEDIUM | HIGH | Magic number verification, file content validation |

**Controls Implemented:**
- ✅ Server-side auth checks on protected routes (cannot be bypassed from client)
- ✅ Input validation using Zod schemas
- ✅ File content validation beyond MIME type checking
- ✅ Filename sanitization

### R - Repudiation

| Threat | Attack Vector | Likelihood | Impact | Mitigation |
|--------|---------------|------------|--------|------------|
| Deny Malicious Actions | Attacker denies performing admin actions | LOW | MEDIUM | Correlation IDs, request logging |
| No Audit Trail | Cannot trace security incidents | MEDIUM | MEDIUM | Structured logging with user IDs |

**Controls Implemented:**
- ✅ Correlation IDs for request tracing
- ✅ Authentication event logging
- ✅ Admin action logging
- 🔄 TODO: Centralized logging service (Sentry/CloudWatch)

### I - Information Disclosure

| Threat | Attack Vector | Likelihood | Impact | Mitigation |
|--------|---------------|------------|--------|------------|
| Stack Trace Leakage | Error messages expose internal structure | MEDIUM | LOW | Safe error handler (no stacks in production) |
| Timing Attacks | Login timing reveals valid usernames | LOW | LOW | Constant-time comparison (TODO: implement) |
| Verbose Logging | Logs expose sensitive data | MEDIUM | MEDIUM | Sanitize passwords/tokens from logs |

**Controls Implemented:**
- ✅ Global error handler with environment-specific responses
- ✅ Correlation IDs instead of internal error details
- ✅ Password redaction in request logs
- 🔄 TODO: Implement constant-time string comparison for login

### D - Denial of Service

| Threat | Attack Vector | Likelihood | Impact | Mitigation |
|--------|---------------|------------|--------|------------|
| Brute Force Login | Automated login attempts | HIGH | MEDIUM | Rate limiting (5 attempts / 15 min) |
| Upload Exhaustion | Large/many file uploads | MEDIUM | MEDIUM | Upload rate limits, file size limits |
| API Flooding | Overwhelming API requests | MEDIUM | MEDIUM | Standard rate limits (100 req / 15 min) |

**Controls Implemented:**
- ✅ Auth rate limiting (5 attempts / 15 min)
- ✅ Upload rate limiting (10 uploads / hour)
- ✅ Standard API rate limiting (100 requests / 15 min)
- ✅ Webhook rate limiting (30 requests / min)
- ✅ Request size limits (10MB)

### E - Elevation of Privilege

| Threat | Attack Vector | Likelihood | Impact | Mitigation |
|--------|---------------|------------|--------|------------|
| **CRITICAL: Admin Escalation via Client Tampering** | Modify `/api/user` response or session data | **HIGH** | **CRITICAL** | `requireAdmin` middleware checks server session |
| Weak Session Secret | Predictable sessions allow privilege escalation | HIGH | CRITICAL | Strong random session secret (64+ bytes) |
| Direct Object Reference | Access other users' resources by ID manipulation | MEDIUM | HIGH | `requireOwnership` middleware (TODO: implement fully) |

**Controls Implemented:**
- ✅ Server-side admin checks in `requireAdmin` middleware
- ✅ Strong session secret enforcement
- ✅ Admin routes protected with `requireAuth` + `requireAdmin`
- 🔄 TODO: Implement `requireOwnership` for user resources

## Attack Scenarios

### Scenario 1: Fiddler MITM Admin Escalation (CRITICAL)

**Attack Steps:**
1. Attacker logs in as regular user
2. Opens Fiddler/Burp Suite to intercept traffic
3. Intercepts `/api/user` response
4. Modifies response: `{"loggedIn": true, "user": {"id": "1", "username": "attacker", "admin": true}}`
5. Attempts to access `/admin.html`

**Without Security Baseline:**
- ❌ Client-side JavaScript checks `data.user.admin` and allows access
- ❌ Admin APIs accessible because client thinks user is admin

**With Security Baseline:**
- ✅ Server-side `requireAdmin` middleware checks `req.session.user.admin` from **SERVER SESSION**
- ✅ Tampered client response is ignored; server session is source of truth
- ✅ Attacker receives 403 Forbidden
- ✅ Admin actions are logged with real user ID

**Mitigation:** server.js:392, server.js:399, server.js:466, server.js:472 - `requireAuth, requireAdmin` middleware

### Scenario 2: Mass Upload DoS

**Attack Steps:**
1. Attacker attempts to upload many large files to exhaust storage
2. Sends 100 upload requests in rapid succession

**Mitigation:**
- ✅ Upload rate limit: 10 uploads per hour per IP
- ✅ File size limit: 10MB per file
- ✅ File content validation rejects invalid files
- ✅ 429 Too Many Requests after limit exceeded

**Implementation:** server.js:618, security/baseline/rateLimit.js:51

### Scenario 3: Webhook Replay Attack

**Attack Steps:**
1. Attacker captures legitimate webhook request
2. Replays it multiple times to spam Discord

**Current State:** ⚠️  Webhook endpoint has rate limiting but no signature verification

**Mitigation:**
- ✅ Rate limiting (30 requests / minute)
- 🔄 TODO: Implement Discord Ed25519 signature verification
- 🔄 TODO: Timestamp validation (reject old requests)

**Implementation:** security/baseline/webhookVerify.js (prepared but not fully wired)

## Residual Risks

### HIGH Priority (Address in v1.1)

1. **No webhook signature verification**
   - Risk: Forged webhook requests
   - Mitigation: Implement Discord Ed25519 verification
   - File: security/baseline/webhookVerify.js (ready, needs wiring)

2. **File-based user storage**
   - Risk: No password hashing, no scalability
   - Mitigation: Migrate to database with bcrypt/argon2
   - Effort: Medium

### MEDIUM Priority (Address in v1.2)

3. **No CSRF tokens**
   - Risk: CSRF attacks on state-changing forms
   - Current Mitigation: SameSite=Strict cookies (partial protection)
   - Full Mitigation: Implement CSRF tokens

4. **No content security for uploaded files**
   - Risk: Malicious SVG/HTML files with embedded scripts
   - Mitigation: Serve uploads from separate domain, add Content-Disposition

5. **No rate limiting on public endpoints**
   - Risk: Scraping, reconnaissance
   - Mitigation: Add rate limits to public API endpoints

### LOW Priority (Address in v1.3+)

6. **No two-factor authentication**
7. **No IP-based geolocation blocking**
8. **No automated vulnerability scanning in CI/CD**

## Compliance Considerations

### GDPR (if applicable)
- ✅ User data minimization
- ✅ Secure session management
- 🔄 TODO: Data retention policies
- 🔄 TODO: User data export/deletion endpoints

### OWASP Top 10 (2021)

| Risk | Status | Notes |
|------|--------|-------|
| A01 Broken Access Control | ✅ MITIGATED | Server-side auth checks |
| A02 Cryptographic Failures | ✅ MITIGATED | Strong session secrets, HTTPS required |
| A03 Injection | ✅ MITIGATED | Input validation, parameterized queries |
| A04 Insecure Design | ✅ MITIGATED | Security baseline architecture |
| A05 Security Misconfiguration | ⚠️  PARTIAL | Helmet configured, secrets externalized |
| A06 Vulnerable Components | ⚠️  PARTIAL | Dependencies audited, 1 moderate vuln remains |
| A07 Auth & Session Failures | ✅ MITIGATED | Secure session management |
| A08 Software & Data Integrity | ⚠️  PARTIAL | No webhook signatures yet |
| A09 Logging Failures | ✅ MITIGATED | Structured logging with correlation IDs |
| A10 SSRF | ⚠️  PARTIAL | No outbound request validation yet |

## Security Testing Recommendations

1. **Penetration Testing**
   - Focus on client-side tampering scenarios
   - Test admin escalation attempts
   - Verify rate limiting effectiveness

2. **Automated Scanning**
   - Enable Dependabot / Snyk
   - Add SAST (Static Application Security Testing)
   - Add DAST (Dynamic Application Security Testing)

3. **Code Review**
   - All new routes must use `requireAuth`/`requireAdmin`
   - All user inputs must have validation schemas
   - No hardcoded secrets

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [STRIDE Threat Model](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

*Last Updated: 2025-01-XX*
*Next Review: 2025-04-XX (Quarterly)*
