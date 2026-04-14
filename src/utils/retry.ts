import { logger } from "./logger.js";

export const withRetry = async <T>(
  fn: () => Promise<T>,
  opts: { retries?: number; baseDelayMs?: number; context?: Record<string, unknown> } = {}
): Promise<T> => {
  const retries = opts.retries ?? 2;
  const baseDelayMs = opts.baseDelayMs ?? 400;

  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      logger.error("Provider API call failed", { attempt, retries, ...opts.context, error: String(error) });

      if (attempt > retries) {
        throw error;
      }

      const wait = baseDelayMs * attempt;
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }
};
