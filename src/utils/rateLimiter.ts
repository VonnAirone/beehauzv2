/**
 * Rate Limiter Utility
 * Prevents brute force attacks by limiting the number of attempts within a time window
 */

interface RateLimitEntry {
  attempts: number[];
  blockedUntil?: number;
}

export class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map();
  private maxAttempts: number;
  private windowMs: number;
  private blockDurationMs: number;

  /**
   * Creates a new RateLimiter
   * @param maxAttempts - Maximum number of attempts allowed within the time window (default: 5)
   * @param windowMs - Time window in milliseconds (default: 15 minutes)
   * @param blockDurationMs - Duration to block after exceeding limits (default: 15 minutes)
   */
  constructor(
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000, // 15 minutes
    blockDurationMs: number = 15 * 60 * 1000 // 15 minutes
  ) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.blockDurationMs = blockDurationMs;
  }

  /**
   * Checks if an action is allowed for a given key
   * @param key - Unique identifier (e.g., email, IP address)
   * @returns Object with isAllowed boolean and optional timeRemaining
   */
  isAllowed(key: string): { isAllowed: boolean; timeRemaining?: number; attemptsRemaining?: number } {
    const now = Date.now();
    const entry = this.attempts.get(key);

    // Check if currently blocked
    if (entry?.blockedUntil && entry.blockedUntil > now) {
      const timeRemaining = Math.ceil((entry.blockedUntil - now) / 1000);
      return { isAllowed: false, timeRemaining };
    }

    // Clear block if expired
    if (entry?.blockedUntil && entry.blockedUntil <= now) {
      this.attempts.delete(key);
      return { isAllowed: true, attemptsRemaining: this.maxAttempts };
    }

    // Filter out attempts outside the time window
    const recentAttempts = entry?.attempts.filter(
      timestamp => now - timestamp < this.windowMs
    ) || [];

    // Check if within allowed attempts
    if (recentAttempts.length < this.maxAttempts) {
      return {
        isAllowed: true,
        attemptsRemaining: this.maxAttempts - recentAttempts.length
      };
    }

    // Exceeded attempts - block the key
    this.attempts.set(key, {
      attempts: recentAttempts,
      blockedUntil: now + this.blockDurationMs,
    });

    const timeRemaining = Math.ceil(this.blockDurationMs / 1000);
    return { isAllowed: false, timeRemaining };
  }

  /**
   * Records an attempt for a given key
   * @param key - Unique identifier (e.g., email, IP address)
   */
  recordAttempt(key: string): void {
    const now = Date.now();
    const entry = this.attempts.get(key);

    // Filter recent attempts within window
    const recentAttempts = entry?.attempts.filter(
      timestamp => now - timestamp < this.windowMs
    ) || [];

    // Add current attempt
    recentAttempts.push(now);

    // Update entry
    this.attempts.set(key, {
      attempts: recentAttempts,
      blockedUntil: entry?.blockedUntil,
    });
  }

  /**
   * Resets attempts for a given key (e.g., after successful login)
   * @param key - Unique identifier (e.g., email, IP address)
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Clears all rate limit data (useful for testing)
   */
  clearAll(): void {
    this.attempts.clear();
  }

  /**
   * Gets the remaining attempts for a key
   * @param key - Unique identifier
   * @returns Number of remaining attempts
   */
  getRemainingAttempts(key: string): number {
    const now = Date.now();
    const entry = this.attempts.get(key);

    if (!entry || (entry.blockedUntil && entry.blockedUntil <= now)) {
      return this.maxAttempts;
    }

    const recentAttempts = entry.attempts.filter(
      timestamp => now - timestamp < this.windowMs
    );

    return Math.max(0, this.maxAttempts - recentAttempts.length);
  }
}

// Create singleton instances for different use cases
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000, 15 * 60 * 1000); // 5 attempts per 15 min
export const passwordResetRateLimiter = new RateLimiter(3, 60 * 60 * 1000, 60 * 60 * 1000); // 3 attempts per hour
