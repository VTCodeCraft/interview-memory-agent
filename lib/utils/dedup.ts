/**
 * In-flight de-duplication for expensive, side-effecting operations.
 *
 * Prevents duplicate Gemini calls / duplicate report generation when the same
 * operation is requested concurrently (double-click, two routes racing, a retry
 * landing while the first is still running). The first caller runs `fn`; every
 * concurrent caller with the same `key` awaits the SAME promise instead of
 * starting a second run. The cached promise is cleared once it settles so a
 * later, genuinely new request runs fresh.
 *
 * Note: this is per-server-process (module-level Map). That is sufficient for a
 * single Node server and for the common double-trigger races described above.
 */

const locks = new Map<string, Promise<unknown>>();

export function withInFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = locks.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = (async () => {
    try {
      return await fn();
    } finally {
      // Always release the lock so a subsequent request can run.
      locks.delete(key);
    }
  })();

  locks.set(key, promise);
  return promise;
}
