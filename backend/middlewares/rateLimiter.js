const rateLimitMap = new Map();

// Simple in-memory rate limiter middleware
// Default: 100 requests per 15 minutes per IP
module.exports = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    // Skip rate limiting in development mode if preferred
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, []);
    }

    const requests = rateLimitMap.get(ip);
    // Filter out requests outside the time window
    const activeRequests = requests.filter(timestamp => now - timestamp < windowMs);
    
    if (activeRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests from this client. Please slow down and try again later.'
      });
    }

    // Add current request timestamp
    activeRequests.push(now);
    rateLimitMap.set(ip, activeRequests);

    // Add headers indicating limits
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - activeRequests.length);

    next();
  };
};
