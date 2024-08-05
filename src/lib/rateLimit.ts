import { LRUCache } from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number; // requests per interval (old request will be removed when new request comes in if the limit is reached)
  interval?: number;
};

// Fungsi rateLimit digunakan untuk membatasi jumlah request yang masuk per interval
// Contoh dari Official nextjs: https://nextjs-rate-limit.vercel.app
export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: (header: Headers, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;

        header.set('X-RateLimit-Limit', `${limit}`);
        header.set('X-RateLimit-Remaining', isRateLimited ? `0` : `${limit - currentUsage}`);

        return isRateLimited ? reject() : resolve();
      }),
  };
}
