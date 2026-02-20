export class RateLimit {
    private cache: Map<string, number>;
    private limit: number;
    private windowMs: number;

    constructor({ limit, windowMs }: { limit: number; windowMs: number }) {
        this.cache = new Map();
        this.limit = limit;
        this.windowMs = windowMs;
    }

    check(id: string): boolean {
        const now = Date.now();
        const tokenCount = this.cache.get(id) || 0;

        // Clear out cache periodically to prevent memory leaks in long-running processes (though unlikely in serverless)
        if (this.cache.size > 10000) {
            this.cache.clear();
        }

        if (tokenCount >= this.limit) {
            return false;
        }

        this.cache.set(id, tokenCount + 1);

        // Expire the token after the window
        setTimeout(() => {
            const current = this.cache.get(id);
            if (current && current > 0) {
                this.cache.set(id, current - 1);
                if (this.cache.get(id) === 0) {
                    this.cache.delete(id);
                }
            }
        }, this.windowMs);

        return true;
    }
}

// Global instances so they potentially survive hot reloads or multiple sequential invocations on the same container
export const otpRateLimit = new RateLimit({
    limit: 5,        // 5 requests
    windowMs: 60000, // per 1 minute
});
