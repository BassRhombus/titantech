# Migration Guide - Security Baseline v1.0

## Overview

This document provides step-by-step instructions for deploying the security baseline to production with minimal downtime.

**Estimated Downtime:** 5-10 minutes (session invalidation)
**Rollback Time:** < 2 minutes

## Pre-Migration Checklist

- [ ] Review [SECURITY.md](./SECURITY.md) and [THREATMODEL.md](./THREATMODEL.md)
- [ ] Backup current codebase and data files
- [ ] Test migration in staging environment
- [ ] Generate strong session secret
- [ ] Prepare environment variables
- [ ] Schedule maintenance window
- [ ] Notify users of planned session invalidation

## Migration Steps

### Step 1: Backup

```bash
# Backup current code
git branch backup-pre-security-baseline-$(date +%Y%m%d)
git push origin backup-pre-security-baseline-$(date +%Y%m%d)

# Backup data files
cp -r data/ data.backup.$(date +%Y%m%d)/
cp -r uploads/ uploads.backup.$(date +%Y%m%d)/

# Backup current .env (if exists)
cp .env .env.backup.$(date +%Y%m%d)
```

### Step 2: Deploy Code

```bash
# Pull latest code with security baseline
git fetch origin
git checkout security-baseline-v1  # Or merge to main
git pull origin security-baseline-v1

# Install new dependencies
npm install

# Verify dependencies installed correctly
npm list helmet express-rate-limit cors zod dotenv
```

**New Dependencies Added:**
- `helmet@^8.1.0` - Security headers
- `express-rate-limit@^8.1.0` - Rate limiting
- `cors@^2.8.5` - CORS management
- `zod@^4.1.12` - Input validation
- `dotenv@^17.2.3` - Environment variables

### Step 3: Configure Environment

```bash
# Generate strong session secret
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# Create .env file
cat > .env << EOF
# Production Configuration
NODE_ENV=production
PORT=25011
TRUST_PROXY=true

# Session Security - CRITICAL!
SESSION_SECRET=$SESSION_SECRET

# API Configuration
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
GSH_API_TOKEN=your_gsh_api_token_here
GSH_API_HOST=pot-api.gsh-servers.com

# CORS - Add your production domains
ALLOWED_ORIGINS=https://titantech.party,https://www.titantech.party

# Rate Limiting (adjust based on traffic)
RATE_LIMIT_WINDOW_MS=15
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=5
UPLOAD_RATE_LIMIT_MAX=10

# File Uploads
MAX_FILE_SIZE=10485760
VALIDATE_FILE_CONTENT=true

# Admin Credentials - CHANGE IMMEDIATELY
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(16).toString('base64'))")

# Security Features
ENABLE_HSTS=true
ENABLE_CSP=true
STRICT_CORS=true
VERIFY_WEBHOOKS=false  # Set to true when webhook verification is configured

# Logging
LOG_LEVEL=info
AUDIT_LOG_ENABLED=true
DEBUG_MODE=false
VERBOSE_LOGS=false
EOF

# Secure the .env file
chmod 600 .env

# Verify environment
node -e "require('dotenv').config(); console.log('SESSION_SECRET length:', process.env.SESSION_SECRET.length);"
```

### Step 4: Update Reverse Proxy (if applicable)

If using nginx or similar:

```nginx
# nginx configuration updates
server {
    listen 443 ssl http2;
    server_name titantech.party www.titantech.party;

    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers (complementary to app-level headers)
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Proxy settings
    location / {
        proxy_pass http://localhost:25011;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name titantech.party www.titantech.party;
    return 301 https://$server_name$request_uri;
}
```

Reload nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Restart Application

```bash
# Stop current server
pm2 stop titantech  # or whatever process manager you use

# Start with new configuration
NODE_ENV=production pm2 start server.js --name titantech

# Verify server started
pm2 logs titantech --lines 50

# Check for security baseline banner
curl -I https://titantech.party
# Should see security headers (X-Content-Type-Options, etc.)
```

**Expected Startup Output:**
```
======================================================================
TitanTech Hub Server
======================================================================
Environment: production
Server running at http://0.0.0.0:25011/
Security baseline: ENABLED
Session secret: 128 characters
======================================================================
```

### Step 6: Verify Deployment

#### 6.1 Test Authentication

```bash
# Test login rate limiting (should block after 5 attempts)
for i in {1..6}; do
  curl -X POST https://titantech.party/login \
    -d "username=test&password=wrong" \
    -c cookies.txt
  echo "Attempt $i"
done
# Attempt 6 should return 429 Too Many Requests
```

#### 6.2 Test Admin Protection

```bash
# Try to access admin without authentication
curl -I https://titantech.party/admin.html
# Should get 302 redirect to /login.html

# Try to access admin API
curl https://titantech.party/api/admin/commissions
# Should return 401 Unauthorized
```

#### 6.3 Test Security Headers

```bash
# Check security headers are present
curl -I https://titantech.party | grep -E "(X-|Content-Security|Strict-Transport)"

# Should see:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# Content-Security-Policy: ...
```

#### 6.4 Test File Upload

```bash
# Test upload rate limiting
for i in {1..11}; do
  curl -X POST https://titantech.party/api/showcase/submit \
    -F "imageFile=@test.png" \
    -F "imageTitle=Test $i" \
    -F "authorName=Tester"
  echo "Upload $i"
done
# Upload 11 should return 429 (rate limited)
```

### Step 7: Monitor

```bash
# Watch logs for errors
pm2 logs titantech --lines 100

# Monitor for security events
tail -f logs/security-audit.log  # if you've set up file logging

# Check for failed login attempts
pm2 logs titantech | grep "Failed login attempt"

# Check for rate limit triggers
pm2 logs titantech | grep "Rate limit exceeded"
```

## Post-Migration Tasks

### Immediate (Day 1)

- [ ] Monitor logs for errors
- [ ] Verify user logins work
- [ ] Test admin functionality
- [ ] Check upload functionality
- [ ] Verify webhook delivery (if configured)
- [ ] Test all critical user flows

### Week 1

- [ ] Review security event logs
- [ ] Check for unusual rate limit triggers
- [ ] Verify no degraded performance
- [ ] Update admin password from default
- [ ] Review correlation IDs in error logs

### Month 1

- [ ] Conduct security audit
- [ ] Review and tune rate limits based on actual traffic
- [ ] Implement remaining TODOs (webhook signatures, etc.)
- [ ] Schedule penetration testing

## Rollback Procedure

If critical issues are discovered:

```bash
# 1. Switch back to old code
git checkout backup-pre-security-baseline-YYYYMMDD

# 2. Reinstall old dependencies
npm install

# 3. Restore old .env (or remove dotenv requirement)
cp .env.backup.YYYYMMDD .env

# 4. Restart server
pm2 restart titantech

# 5. Verify rollback
curl -I https://titantech.party

# Total time: < 2 minutes
```

**Note:** Rollback will invalidate all active sessions.

## Common Issues & Solutions

### Issue 1: "SESSION_SECRET is not set" Error

**Symptom:** Server fails to start with environment variable error

**Solution:**
```bash
# Verify .env file exists and is readable
ls -la .env
cat .env | grep SESSION_SECRET

# Ensure dotenv is loaded
node -e "require('dotenv').config(); console.log(process.env.SESSION_SECRET ? 'OK' : 'NOT SET');"

# Regenerate if needed
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" >> .env
```

### Issue 2: All Users Logged Out

**Symptom:** Users report being logged out after deployment

**Expected:** This is normal when SESSION_SECRET changes. All sessions are invalidated for security.

**Solution:**
- Inform users this is expected
- Users need to log in again
- Sessions will remain valid for 7 days after re-login

### Issue 3: Admin Cannot Access Admin Panel

**Symptom:** Admin user gets 403 Forbidden on /admin.html

**Diagnosis:**
```bash
# Check if admin flag is set in session
# (requires logged-in session cookie)
curl https://titantech.party/api/user -b cookies.txt

# Should show: {"loggedIn": true, "user": {"admin": true}}
```

**Solution:**
- Verify DEFAULT_ADMIN_USERNAME matches login username
- Check users array in server.js has admin: true
- Clear browser cookies and log in again

### Issue 4: Rate Limiting Too Aggressive

**Symptom:** Legitimate users getting 429 errors

**Solution:**
```bash
# Adjust rate limits in .env
echo "RATE_LIMIT_MAX=200" >> .env  # Double the limit
echo "AUTH_RATE_LIMIT_MAX=10" >> .env

# Restart
pm2 restart titantech

# Monitor and adjust based on traffic patterns
```

### Issue 5: CORS Errors

**Symptom:** Browser console shows CORS errors

**Solution:**
```bash
# Add missing origins to .env
echo "ALLOWED_ORIGINS=https://titantech.party,https://www.titantech.party,https://cdn.titantech.party" >> .env

# For development
echo "CORS_DEV_MODE=true" >> .env

# Restart
pm2 restart titantech
```

## Performance Considerations

### Baseline Performance Impact

- **Memory:** +15-20MB (security modules)
- **CPU:** Minimal (<5% increase for validation)
- **Latency:** +2-5ms per request (validation overhead)
- **Throughput:** No significant impact

### Optimization Tips

1. **Enable Response Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Adjust Rate Limits for Your Traffic**
   - Monitor actual request rates
   - Set limits 20% above normal peak traffic
   - Use stricter limits for sensitive endpoints

3. **Cache Static Assets**
   - Use nginx to serve static files
   - Enable browser caching with proper headers

## Security Baseline Updates

To update the security baseline in the future:

```bash
# Pull latest security updates
git fetch origin
git merge origin/security-baseline-v1.1

# Review CHANGELOG for breaking changes
cat CHANGELOG.md

# Install updated dependencies
npm install

# Review .env.example for new variables
diff .env.example .env

# Test in staging
NODE_ENV=staging npm start

# Deploy to production (follow steps 1-7 above)
```

## Support

For issues or questions:
- **Security Issues:** security@titantech.party
- **General Support:** support@titantech.party
- **Documentation:** [SECURITY.md](./SECURITY.md), [THREATMODEL.md](./THREATMODEL.md)

---

*Last Updated: 2025-01-XX*
*Version: 1.0.0*
