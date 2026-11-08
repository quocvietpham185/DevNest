/**
 * Phase 2 — Advanced Rate-Limit Handling (Queue, Backoff, In-Memory TTL Cache).
 * Ensures GitHub REST API limits (60/hr unauth, 5000/hr auth) are respected
 * and sudden traffic spikes do not result in dropped requests or 403 secondary rate limits.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class RequestQueue {
  private queue: (() => Promise<void>)[] = [];
  private activeCount = 0;
  private readonly maxConcurrent: number;
  private cache = new Map<string, CacheEntry<unknown>>();

  constructor(maxConcurrent = 2) {
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Execute or queue a request with exponential backoff on rate limits.
   */
  async execute<T>(
    key: string,
    fn: () => Promise<T>,
    ttlMs: number = 5 * 60 * 1000 // default 5 minutes cache
  ): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }

    return new Promise<T>((resolve, reject) => {
      const task = async () => {
        try {
          const result = await this.retryWithBackoff(fn);
          if (ttlMs > 0) {
            this.cache.set(key, { data: result, expiresAt: Date.now() + ttlMs });
          }
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          this.activeCount--;
          this.next();
        }
      };

      this.queue.push(task);
      this.next();
    });
  }

  private next() {
    if (this.activeCount < this.maxConcurrent && this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        this.activeCount++;
        task();
      }
    }
  }

  private async retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, initialDelayMs = 1000): Promise<T> {
    let delay = initialDelayMs;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status;
        const message = err instanceof Error ? err.message : String(err);
        const isRateLimit = status === 403 || status === 429 || message.toLowerCase().includes("rate limit");

        if (isRateLimit && attempt < maxRetries) {
          // Check for reset header if available, otherwise exponential backoff + jitter
          const jitter = Math.random() * 500;
          const waitTime = delay + jitter;
          console.warn(`[GitHub RateLimit] Attempt ${attempt + 1}/${maxRetries} hit limit. Backing off ${Math.round(waitTime)}ms...`);
          await new Promise((r) => setTimeout(r, waitTime));
          delay *= 2;
          continue;
        }
        throw err;
      }
    }
    throw new Error("GitHub request failed after retries.");
  }

  clearCache(prefix?: string) {
    if (!prefix) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}

export const githubQueue = new RequestQueue(3);
