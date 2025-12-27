# Security Guidelines

## ⚠️ Cookie Storage Security

### Current Implementation (Phase 1)
- Cookies stored in **localStorage** (client-side)
- **NOT encrypted** - visible in DevTools
- Vulnerable to XSS attacks

### Risks
1. **XSS (Cross-Site Scripting)**: Malicious scripts can read localStorage
2. **Browser Extensions**: Extensions have access to localStorage
3. **Physical Access**: Anyone with access to your computer can view cookies
4. **Session Hijacking**: If cookie leaks, attacker can access your account

### Best Practices (Current Setup)

✅ **DO:**
- Only use on **personal computer**
- Clear credentials when not in use (🗑️ button)
- Don't share screenshots with visible credentials
- Log out from kingfoodmart.com when done
- Use private/incognito mode for testing

❌ **DON'T:**
- Use on public/shared computers
- Share localStorage data with others
- Commit credentials to git
- Leave app open on public networks

### Recommended Improvements (Phase 2+)

#### Option 1: Backend Session Management (Recommended)
```
Frontend → Backend API → KingFoodMart API
           ↑ Store cookie here
           ↑ User authenticates once
```
- Cookie stored **server-side only**
- Frontend gets **session ID** only
- Much more secure

#### Option 2: Encryption
- Encrypt cookie before storing in localStorage
- Decrypt when needed
- Still vulnerable to XSS but adds layer

#### Option 3: Short-lived Tokens
- Request new token for each session
- Auto-clear after 1 hour
- Reduces exposure window

## Current Mitigation

### Auto-clear on close (Optional)
Could implement:
- Clear credentials when closing browser
- Require re-authentication daily
- Warn if credentials > 7 days old

### Token Expiry Detection
- JWT tokens have `exp` field
- App could auto-clear expired tokens
- Prompt re-authentication

## For Production Use

**MUST implement:**
1. ✅ Backend session management
2. ✅ HTTPS only
3. ✅ Rate limiting
4. ✅ CSRF protection
5. ✅ Input sanitization
6. ✅ Content Security Policy

## Trade-offs

| Approach | Security | Convenience | Complexity |
|----------|----------|-------------|------------|
| Current (localStorage) | ⚠️ Low | ✅ High | ✅ Simple |
| Backend sessions | ✅ High | ✅ High | ⚠️ Medium |
| No storage (manual) | ✅ Highest | ❌ Low | ✅ Simple |

## Conclusion

**For personal use on trusted device:** Current approach acceptable
**For production/multi-user:** MUST use backend session management

---
Last updated: 2025-12-26
