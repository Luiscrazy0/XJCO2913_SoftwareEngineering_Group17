import { Logger } from '@nestjs/common';
import { LoggerMiddleware } from './logger.middleware';

type MiddlewareRequest = Parameters<LoggerMiddleware['use']>[0] & {
  requestId?: string;
};
type MiddlewareResponse = Parameters<LoggerMiddleware['use']>[1];

describe('LoggerMiddleware', () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function runWithStatus(statusCode: number) {
    const finishCallbacks: Array<() => void> = [];
    const middleware = new LoggerMiddleware();
    const req = {
      method: 'GET',
      originalUrl: '/health',
      requestId: 'request-123',
    } as unknown as MiddlewareRequest;
    const on = jest.fn((event: string, callback: () => void) => {
      if (event === 'finish') {
        finishCallbacks.push(callback);
      }
      return res;
    });
    const res = {
      statusCode,
      on,
    } as unknown as MiddlewareResponse;
    const next = jest.fn();

    middleware.use(req, res, next);
    finishCallbacks.forEach((callback) => callback());

    expect(next).toHaveBeenCalled();
  }

  it('logs successful responses at info level', () => {
    runWithStatus(200);

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('"level":"info"'),
    );
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('logs client errors at warn level', () => {
    runWithStatus(404);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('"level":"warn"'),
    );
  });

  it('logs server errors at error level', () => {
    runWithStatus(500);

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('"level":"error"'),
    );
  });
});
