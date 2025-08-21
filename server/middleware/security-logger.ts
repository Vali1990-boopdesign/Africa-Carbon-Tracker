
import fs from 'fs/promises';
import path from 'path';

export interface SecurityEvent {
  timestamp: string;
  type: 'BLOCKED_IP' | 'FAILED_AUTH' | 'BOT_DETECTED' | 'CAPTCHA_FAILED' | 'RATE_LIMITED' | 'SUSPICIOUS_ACTIVITY';
  ip: string;
  userAgent?: string;
  endpoint?: string;
  details?: any;
}

class SecurityLogger {
  private logFile: string;
  private events: SecurityEvent[] = [];

  constructor() {
    this.logFile = path.join(process.cwd(), 'security.log');
  }

  async logEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    this.events.push(securityEvent);

    // Keep only last 1000 events in memory
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    // Write to file (in production, consider using proper logging service)
    try {
      await fs.appendFile(this.logFile, JSON.stringify(securityEvent) + '\n');
    } catch (error) {
      console.error('Failed to write security log:', error);
    }

    // Console log for immediate visibility
    console.warn(`🔒 Security Event [${event.type}]: ${event.ip} - ${event.endpoint || 'N/A'}`);
  }

  getRecentEvents(limit = 100): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  async getEventsFromFile(limit = 1000): Promise<SecurityEvent[]> {
    try {
      const data = await fs.readFile(this.logFile, 'utf-8');
      const lines = data.trim().split('\n').slice(-limit);
      return lines.map(line => JSON.parse(line));
    } catch (error) {
      return [];
    }
  }
}

export const securityLogger = new SecurityLogger();

// Middleware to automatically log security events
export const logSecurityEvent = (type: SecurityEvent['type']) => 
  (req: any, res: any, next: any) => {
    securityLogger.logEvent({
      type,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'],
      endpoint: req.path,
      details: { method: req.method, query: req.query }
    });
    next();
  };
