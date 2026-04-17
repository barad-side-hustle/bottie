import "server-only";

const TRANSIENT_CODES = ["CONNECT_TIMEOUT", "CONNECTION_REFUSED", "CONNECTION_ENDED"];

export async function queryWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const code = error instanceof Error && "code" in error ? (error as NodeJS.ErrnoException).code : undefined;
      const isTransient = code ? TRANSIENT_CODES.includes(code) : false;
      if (!isTransient || attempt === maxRetries - 1) throw error;
      const delay = 1000 * Math.pow(2, attempt);
      console.warn(`DB query failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`, error);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("unreachable");
}
