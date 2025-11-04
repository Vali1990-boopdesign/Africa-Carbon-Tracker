
import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { generateCaptcha, verifyCaptcha } from "./captcha";

// IP-based attempt tracking
const failedAttempts = new Map<string, { count: number; lastAttempt: number; blocked: number }>();
const suspiciousIPs = new Set<string>();

// Clean up tracking data every hour
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (const [ip, data] of failedAttempts.entries()) {
    if (now - data.lastAttempt > oneHour) {
      failedAttempts.delete(ip);
    }
  }
}, 60 * 60 * 1000);

// Enhanced rate limiting with progressive restrictions
export const createSecureRateLimit = (windowMs: number, max: number, skipSuccessfulRequests = false) => 
  rateLimit({
    windowMs,
    max: (req) => {
      const ip = getClientIP(req);
      if (suspiciousIPs.has(ip)) {
        return Math.max(1, Math.floor(max * 0.1)); // 90% reduction for suspicious IPs
      }
      return max;
    },
    message: { error: "Too many requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (req, res) => {
      const ip = getClientIP(req);
      trackFailedAttempt(ip);
      res.status(429).json({ 
        error: "Too many requests. Please slow down.",
        requiresCaptcha: shouldRequireCaptcha(ip)
      });
    },
    // Add skip for health checks
    skip: (req) => req.path === '/health' || req.path === '/ready'
  });

// Very strict rate limit for data export/scraping attempts
export const strictDataProtection = createSecureRateLimit(
  60 * 60 * 1000, // 1 hour
  3, // Only 3 requests per hour
  false
);

// Get real client IP (handles proxies)
export function getClientIP(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] as string ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.ip ||
         'unknown';
}

// Track failed attempts and suspicious behavior
export function trackFailedAttempt(ip: string): void {
  const now = Date.now();
  const existing = failedAttempts.get(ip) || { count: 0, lastAttempt: 0, blocked: 0 };
  
  existing.count += 1;
  existing.lastAttempt = now;
  
  // Progressive blocking
  if (existing.count >= 10) {
    existing.blocked = now + 60 * 60 * 1000; // 1 hour block
    suspiciousIPs.add(ip);
  } else if (existing.count >= 5) {
    existing.blocked = now + 15 * 60 * 1000; // 15 minute block
  }
  
  failedAttempts.set(ip, existing);
}

export function trackSuccessfulAttempt(ip: string): void {
  const existing = failedAttempts.get(ip);
  if (existing) {
    existing.count = Math.max(0, existing.count - 2); // Reduce count on success
    if (existing.count === 0) {
      failedAttempts.delete(ip);
      suspiciousIPs.delete(ip);
    } else {
      failedAttempts.set(ip, existing);
    }
  }
}

export function isBlocked(ip: string): boolean {
  const attempt = failedAttempts.get(ip);
  return attempt ? attempt.blocked > Date.now() : false;
}

export function shouldRequireCaptcha(ip: string): boolean {
  const attempt = failedAttempts.get(ip);
  return attempt ? attempt.count >= 3 : false;
}

// CAPTCHA middleware
export const requireCaptcha = (req: Request, res: Response, next: NextFunction) => {
  const ip = getClientIP(req);
  
  if (!shouldRequireCaptcha(ip)) {
    return next();
  }
  
  const { captchaId, captchaAnswer } = req.body;
  
  if (!captchaId || captchaAnswer === undefined) {
    const captcha = generateCaptcha();
    return res.status(400).json({
      error: "CAPTCHA verification required",
      captcha: {
        id: captcha.id,
        question: captcha.question
      }
    });
  }
  
  const isValid = verifyCaptcha(captchaId, parseInt(captchaAnswer));
  
  if (!isValid) {
    trackFailedAttempt(ip);
    const newCaptcha = generateCaptcha();
    return res.status(400).json({
      error: "Invalid CAPTCHA. Please try again.",
      captcha: {
        id: newCaptcha.id,
        question: newCaptcha.question
      }
    });
  }
  
  trackSuccessfulAttempt(ip);
  next();
};

// IP blocking middleware
export const blockSuspiciousIPs = (req: Request, res: Response, next: NextFunction) => {
  const ip = getClientIP(req);
  
  if (isBlocked(ip)) {
    const attempt = failedAttempts.get(ip);
    const remainingTime = attempt ? Math.ceil((attempt.blocked - Date.now()) / 1000 / 60) : 0;
    
    return res.status(403).json({
      error: "IP temporarily blocked due to suspicious activity",
      unblockIn: `${remainingTime} minutes`,
      contact: "Contact support if you believe this is an error"
    });
  }
  
  next();
};

// Enhanced API key validation with attempts tracking
export const requireSecureApiKey = (req: Request, res: Response, next: NextFunction) => {
  const ip = getClientIP(req);
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const validApiKey = process.env.API_KEY;
  
  // Development bypass
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  if (!validApiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }
  
  if (!apiKey) {
    trackFailedAttempt(ip);
    return res.status(401).json({ 
      error: "API key required",
      requiresCaptcha: shouldRequireCaptcha(ip)
    });
  }
  
  if (apiKey !== validApiKey) {
    trackFailedAttempt(ip);
    return res.status(401).json({ 
      error: "Invalid API key",
      requiresCaptcha: shouldRequireCaptcha(ip)
    });
  }
  
  trackSuccessfulAttempt(ip);
  next();
};

// Request fingerprinting to detect bots
export const detectBots = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers['user-agent'] || '';
  const acceptHeader = req.headers['accept'] || '';
  const ip = getClientIP(req);
  
  // Bot detection heuristics
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i, /python/i, /requests/i
  ];
  
  const isSuspiciousUserAgent = botPatterns.some(pattern => pattern.test(userAgent));
  const lacksTypicalHeaders = !acceptHeader.includes('text/html') && !acceptHeader.includes('application/json');
  const hasNoUserAgent = !userAgent;
  
  if (isSuspiciousUserAgent || (lacksTypicalHeaders && hasNoUserAgent)) {
    suspiciousIPs.add(ip);
    trackFailedAttempt(ip);
    
    return res.status(403).json({
      error: "Automated requests detected. Please use the web interface.",
      hint: "If you're building an integration, contact us for proper API access."
    });
  }
  
  next();
};

// Request timing tracking for bot detection
const requestTimings = new Map<string, number[]>();

export function trackRequestTiming(ip: string): void {
  const now = Date.now();
  const timings = requestTimings.get(ip) || [];
  
  // Keep only last 10 requests
  timings.push(now);
  if (timings.length > 10) {
    timings.shift();
  }
  
  requestTimings.set(ip, timings);
  
  // Check for bot-like behavior (too fast, too regular)
  if (timings.length >= 5) {
    const intervals = [];
    for (let i = 1; i < timings.length; i++) {
      intervals.push(timings[i] - timings[i - 1]);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => {
      return sum + Math.pow(interval - avgInterval, 2);
    }, 0) / intervals.length;
    
    // Bots often have very regular intervals or very fast requests
    const isVeryFast = avgInterval < 100; // Less than 100ms between requests
    const isTooRegular = variance < 10; // Almost identical intervals
    
    if (isVeryFast || isTooRegular) {
      suspiciousIPs.add(ip);
      trackFailedAttempt(ip);
      console.warn(`🤖 Bot-like timing detected from IP: ${ip}, avg: ${avgInterval}ms, variance: ${variance}`);
    }
  }
}

// Clean up old timing data
setInterval(() => {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  for (const [ip, timings] of requestTimings.entries()) {
    if (timings.length > 0 && now - timings[timings.length - 1] > fiveMinutes) {
      requestTimings.delete(ip);
    }
  }
}, 60 * 1000); // Clean every minute

// Honey pot endpoint to catch bots
export const honeypot = (req: Request, res: Response) => {
  const ip = getClientIP(req);
  suspiciousIPs.add(ip);
  trackFailedAttempt(ip);
  
  // Log the attempt
  console.warn(`🍯 Honeypot triggered by IP: ${ip}, User-Agent: ${req.headers['user-agent']}`);
  
  // Respond with fake data to waste bot's time
  res.json({
    data: "This endpoint is for monitoring purposes only.",
    timestamp: new Date().toISOString(),
    id: crypto.randomUUID()
  });
};

// Middleware to track request timing
export const trackTiming = (req: Request, res: Response, next: NextFunction) => {
  const ip = getClientIP(req);
  trackRequestTiming(ip);
  next();
};

// Middleware to obfuscate data for suspicious IPs
export const protectSensitiveData = (req: Request, res: Response, next: NextFunction) => {
  const ip = getClientIP(req);
  
  if (suspiciousIPs.has(ip) || isBlocked(ip)) {
    // Override json method to return limited data
    const originalJson = res.json.bind(res);
    res.json = function(data: any) {
      // Return minimal/fake data for suspicious IPs
      if (Array.isArray(data)) {
        return originalJson({ 
          data: data.slice(0, 3), // Only first 3 items
          message: "Limited results due to unusual activity pattern",
          total: 3
        });
      }
      return originalJson({ 
        message: "Access restricted due to unusual activity pattern",
        hint: "Please contact support if you believe this is an error"
      });
    };
  }
  
  next();
};
