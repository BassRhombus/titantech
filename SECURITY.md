# Security Policy - TitanTech

## Overview

This document describes the security baseline implemented for TitanTech, including threat model, security controls, and operational procedures.

**Security Baseline Version:** 1.0.0
**Last Updated:** 2025-01-XX
**Contact:** Security Team

## Table of Contents

1. [Security Baseline](#security-baseline)
2. [Threat Model Summary](#threat-model-summary)
3. [Security Controls](#security-controls)
4. [Configuration](#configuration)
5. [Monitoring & Logging](#monitoring--logging)
6. [Incident Response](#incident-response)
7. [Responsible Disclosure](#responsible-disclosure)

## Security Baseline

TitanTech implements a comprehensive security baseline to protect against common web application vulnerabilities and prevent client-side tampering attacks.

### Key Security Features

- **Strong Session Management**: HTTP-only, Secure, SameSite cookies with server-side verification
- **Input Validation**: Centralized schema validation using Zod for all user inputs
- **Rate Limiting**: Protection against brute force and DoS attacks
- **Security Headers**: Helmet.js with CSP, HSTS, and additional hardening
- **CORS**: Explicit allowlist with no wildcard origins
- **Authentication Guards**: Server-side verification on all protected routes
- **Safe Error Handling**: No information disclosure through error messages
- **Secure File Uploads**: Content validation, size limits, and path traversal protection

## Threat Model Summary

See [THREATMODEL.md](./THREATMODEL.md) for detailed analysis.

### Primary Threats Addressed

1. **Client-Side Tampering (Fiddler/MITM)**
   - Admin privilege escalation through tampered responses
   - Session manipulation and forgery
   - Mitigated through server-side session verification

2. **Authentication Attacks**
   - Brute force login attempts
   - Session fixation and hijacking
   - Mitigated through rate limiting and secure session management

3. **Injection Attacks**
   - SQL/NoSQL injection (when database is added)
   - Command injection
   - Path traversal
   - Mitigated through input validation and parameterized queries

4. **Cross-Site Attacks**
   - XSS (Cross-Site Scripting)
   - CSRF (Cross-Site Request Forgery)
   - Clickjacking
   - Mitigated through CSP, SameSite cookies, and security headers

5. **File Upload Attacks**
   - Malicious file execution
   - Path traversal via filenames
   - Storage exhaustion
   - Mitigated through validation, sanitization, and size limits

## Security Controls

### Authentication & Authorization

#### Session Management
- **Implementation**: `security/baseline/serverAuth.js`
- **Cookie Flags**: HTTP-only, Secure (production), SameSite=Strict
- **Session Duration**: 7 days with rolling expiration
- **Session Regeneration**: On login to prevent fixation attacks

#### Authorization Checks
- **Server-Side Only**: All auth decisions made server-side from session data
- **Admin Middleware**: `requireAdmin` enforces admin privileges on sensitive routes
- **Resource Ownership**: `requireOwnership` prevents unauthorized access to resources

**Example Usage:**
```javascript
// Protected route
app.get('/dashboard.html', requireAuth, (req, res) => { ... });

// Admin-only route
app.get('/api/admin/users', requireAuth, requireAdmin, (req, res) => { ... });
```

### Input Validation

#### Schema Validation
- **Implementation**: `security/baseline/validation.js`
- **Library**: Zod for runtime schema validation
- **Coverage**: All POST/PUT endpoints with user input

**Example Schemas:**
- Commission submissions
- Showcase submissions
- Server submissions
- Status updates

**Usage:**
```javascript
app.post('/api/commission',
  uploadRateLimit,
  validate(commissionSubmissionSchema),
  async (req, res) => { ... }
);
```

### Rate Limiting

#### Endpoint-Specific Limits
- **Standard API**: 100 requests / 15 minutes
- **Authentication**: 5 attempts / 15 minutes
- **File Uploads**: 10 uploads / hour
- **Webhooks**: 30 requests / minute

**Implementation**: `security/baseline/rateLimit.js`

### Security Headers

#### Helmet Configuration
- **CSP**: Content Security Policy with allowlist
- **HSTS**: Strict-Transport-Security (production only)
- **Frame Options**: X-Frame-Options: DENY
- **Content Type**: X-Content-Type-Options: nosniff
- **XSS Protection**: X-XSS-Protection: 1; mode=block

#### Additional Headers
- Permissions-Policy
- Cross-Origin policies (COEP, COOP, CORP)
- X-Permitted-Cross-Domain-Policies

### CORS (Cross-Origin Resource Sharing)

#### Configuration
- **Allowlist-Only**: Explicit origins, no wildcards
- **Credentials**: Allowed for same-origin
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Production Origins**: titantech.party
- **Development**: localhost variations

**Configuration**: `security/baseline/cors.js`

### File Upload Security

#### Protection Measures
- **MIME Type Validation**: Server-side verification
- **File Content Validation**: Magic number checking
- **Filename Sanitization**: Remove path traversal characters
- **Size Limits**: 10MB for showcase images
- **Random Filenames**: Prevent prediction and overwriting
- **Storage**: Outside web root when possible

**Implementation**: `security/baseline/uploads.js`

### Error Handling

#### Safe Error Responses
- **Production**: Generic error messages, no stack traces
- **Development**: Detailed errors for debugging
- **Correlation IDs**: Unique request IDs for tracing
- **Logging**: Separate error logging with context

**Implementation**: `security/baseline/error.js`

## Configuration

### Required Environment Variables

```bash
# Critical - MUST be set
SESSION_SECRET=<64+ character random string>

# Recommended
NODE_ENV=production
PORT=25011
TRUST_PROXY=true  # If behind reverse proxy

# Optional
DISCORD_WEBHOOK_URL=<webhook URL>
GSH_API_TOKEN=<API token>
ALLOWED_ORIGINS=https://titantech.party,https://www.titantech.party
```

See [.env.example](./.env.example) for complete configuration.

### Generating Secrets

```bash
# Generate session secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Monitoring & Logging

### Security Events Logged

1. **Authentication Events**
   - Login attempts (success/failure)
   - Logout events
   - Session creation/destruction

2. **Admin Actions**
   - Commission status updates
   - Showcase approvals/rejections
   - Server management actions

3. **Rate Limit Triggers**
   - IP addresses exceeding limits
   - Endpoint and timestamp

4. **Error Events**
   - 500 errors with correlation IDs
   - Validation failures

### Log Format

```
[timestamp] [correlationId] Event: details
```

### Audit Trail

All security-relevant actions include:
- Correlation ID for request tracing
- User ID (when authenticated)
- Action performed
- Timestamp
- Outcome (success/failure)

## Incident Response

### Suspected Breach Procedure

1. **Immediate Actions**
   - Rotate `SESSION_SECRET` immediately
   - Invalidate all active sessions
   - Review logs for suspicious activity
   - Block offending IPs if identified

2. **Investigation**
   - Collect logs with correlation IDs
   - Review authentication and admin action logs
   - Check for unauthorized data access
   - Identify attack vector

3. **Remediation**
   - Patch identified vulnerabilities
   - Update security controls
   - Document lessons learned
   - Notify affected users if required

4. **Post-Incident**
   - Conduct security review
   - Update threat model
   - Enhance monitoring
   - Schedule penetration test

### Session Secret Rotation

```bash
# 1. Generate new secret
NEW_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# 2. Update .env
echo "SESSION_SECRET=$NEW_SECRET" >> .env

# 3. Restart server (invalidates all sessions)
npm restart
```

## Responsible Disclosure

### Reporting Security Issues

If you discover a security vulnerability, please email: `security@titantech.party`

**Please include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

**Our Commitment:**
- Acknowledge receipt within 48 hours
- Provide status updates every 7 days
- Credit security researchers (if desired)
- Fix critical issues within 30 days

### Scope

**In Scope:**
- Authentication bypass
- Authorization bypass
- Injection vulnerabilities
- XSS and CSRF
- Session management issues
- File upload vulnerabilities

**Out of Scope:**
- Social engineering
- Physical attacks
- DoS attacks (rate limiting handles this)
- Issues in third-party dependencies (report to vendor)

## Security Checklist for Deployments

- [ ] `SESSION_SECRET` is set and >= 64 characters
- [ ] `NODE_ENV=production`
- [ ] `TRUST_PROXY=true` (if behind reverse proxy)
- [ ] HTTPS is enabled and enforced
- [ ] `ALLOWED_ORIGINS` contains only production domains
- [ ] Default admin password has been changed
- [ ] All secrets are in environment variables (not hardcoded)
- [ ] Database uses parameterized queries (when implemented)
- [ ] Logs are being collected and monitored
- [ ] Backups are encrypted and tested
- [ ] Rate limits are appropriate for expected traffic
- [ ] Security headers are enabled (`helmet` configured)
- [ ] File upload directory permissions are restrictive

## Additional Resources

- [THREATMODEL.md](./THREATMODEL.md) - Detailed threat analysis
- [MIGRATION.md](./MIGRATION.md) - Deployment and migration guide
- [.env.example](./.env.example) - Configuration template
- [security/baseline/](./security/baseline/) - Security module source code

## Version History

| Version | Date       | Changes                    |
|---------|------------|----------------------------|
| 1.0.0   | 2025-01-XX | Initial security baseline  |

---

*This security policy is a living document and will be updated as threats evolve and new controls are implemented.*
