import { Logger } from '@nestjs/common';

enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN,
}

export class AmapCircuitBreaker {
  private readonly logger = new Logger(AmapCircuitBreaker.name);
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold = 5;
  private readonly resetTimeout = 30000;
  private readonly timeout = 5000;

  async execute<T>(fn: () => Promise<T>, fallback?: () => T): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
        this.logger.log('Circuit breaker half-open, probing...');
      } else {
        this.logger.warn('Circuit breaker open, rejecting request');
        if (fallback) return fallback();
        throw new Error(
          'Service temporarily unavailable (circuit breaker open)',
        );
      }
    }

    try {
      const result = await this.withTimeout(fn());
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) {
        this.logger.warn(
          `Circuit breaker fallback used: ${(error as Error).message}`,
        );
        return fallback();
      }
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.logger.error(
        `Circuit breaker opened after ${this.failureCount} failures`,
      );
    }
  }

  private withTimeout<T>(promise: Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('Request timeout')),
        this.timeout,
      );
      promise.then(
        (result) => {
          clearTimeout(timer);
          resolve(result);
        },
        (error) => {
          clearTimeout(timer);
          reject(error instanceof Error ? error : new Error(String(error)));
        },
      );
    });
  }
}
