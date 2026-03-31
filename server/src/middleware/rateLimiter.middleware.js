import rateLimit from 'express-rate-limit'

// ─── Auth Routes Limiter ───────────────────────────────────────
// Strict — prevents brute force attacks on login/register
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes
  max: 10,                      // max 10 requests per 15 mins
  message: {
    message: 'Too many attempts from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,        // return rate limit info in headers
  legacyHeaders: false
})

// ─── General API Limiter ──────────────────────────────────────
// Loose — just prevents abuse on general routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes
  max: 200,                     // max 200 requests per 15 mins
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// ─── Invite Limiter ────────────────────────────────────────────
// Prevents invite spam
export const inviteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,    // 1 hour
  max: 20,                      // max 20 invites per hour
  message: {
    message: 'Too many invites sent, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// ─── AI Limiter ────────────────────────────────────────────────
// Prevents AI endpoint abuse since it costs money
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,    // 1 hour
  max: 30,                      // max 30 AI requests per hour
  message: {
    message: 'Too many AI requests, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false
})