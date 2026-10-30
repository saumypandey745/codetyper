/**
 * Lightweight, production-grade in-memory rate limiter middleware.
 * Implements sliding reset window, standard headers (X-RateLimit-*, Retry-After),
 * and automatic unreferenced cache eviction.
 */
export function createRateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 5,
  message = 'Too many attempts. Please take a pause and try again later.',
  keyGenerator = (req) => req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1',
  skipSuccessful = false
} = {}) {
  const store = new Map();

  // Periodic cleanup of expired entries
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, 3 * 60 * 1000);

  if (timer.unref) {
    timer.unref();
  }

  const limiterMiddleware = (req, res, next) => {
    // If in test environment and test explicitly disables rate limiting, bypass
    if (process.env.DISABLE_RATE_LIMIT === 'true') {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();
    let record = store.get(key);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      store.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (record.count > max) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        error: message,
        retryAfter: resetSeconds
      });
    }

    if (skipSuccessful) {
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          if (record && record.count > 0) record.count -= 1;
        }
        return originalJson(body);
      };
    }

    next();
  };

  // Expose store for test assertions and resets
  limiterMiddleware.reset = () => store.clear();
  return limiterMiddleware;
}
