import { logger, Logger } from '@/lib/logger';
import { describe, expect, test, vi } from 'vitest';

describe('Logger Tests', () => {
  test('Logger should log messages at different levels', () => {
    const logLevels = ['info', 'debug', 'trace', 'warn', 'error', 'fatal'];

    logLevels.forEach((level) => {
      const spy = vi.spyOn(logger, level as keyof Logger);
      logger[level as keyof Logger](`hello test logger ${level}. It's running!`);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(`hello test logger ${level}. It's running!`);

      spy.mockRestore();
    });
  });
});
