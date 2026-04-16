import { CallHandler, ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';

const createContext = (statusCode: number): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getResponse: () => ({ statusCode }),
    }),
  }) as unknown as ExecutionContext;

const createCallHandler = (value: unknown): CallHandler => ({
  handle: () => of(value),
});

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<unknown>;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();
  });

  it('wraps a 200 response with the default success message', async () => {
    await expect(
      lastValueFrom(
        interceptor.intercept(
          createContext(200),
          createCallHandler({ id: 'resource-1' }),
        ),
      ),
    ).resolves.toEqual({
      success: true,
      data: { id: 'resource-1' },
      message: 'Request successful',
      timestamp: expect.any(String),
    });
  });

  it('wraps a 201 response with the created message', async () => {
    await expect(
      lastValueFrom(
        interceptor.intercept(
          createContext(201),
          createCallHandler({ id: 'resource-1' }),
        ),
      ),
    ).resolves.toEqual({
      success: true,
      data: { id: 'resource-1' },
      message: 'Resource created successfully',
      timestamp: expect.any(String),
    });
  });

  it('wraps a 204 response with the deleted message', async () => {
    await expect(
      lastValueFrom(
        interceptor.intercept(
          createContext(204),
          createCallHandler({ id: 'resource-1' }),
        ),
      ),
    ).resolves.toEqual({
      success: true,
      data: { id: 'resource-1' },
      message: 'Resource deleted successfully',
      timestamp: expect.any(String),
    });
  });

  it('wraps other status codes with the generic success message', async () => {
    await expect(
      lastValueFrom(
        interceptor.intercept(
          createContext(418),
          createCallHandler({ id: 'resource-1' }),
        ),
      ),
    ).resolves.toEqual({
      success: true,
      data: { id: 'resource-1' },
      message: 'Operation completed successfully',
      timestamp: expect.any(String),
    });
  });

  it('refreshes the timestamp for already-standardized responses', async () => {
    await expect(
      lastValueFrom(
        interceptor.intercept(
          createContext(200),
          createCallHandler({
            success: false,
            error: 'Validation failed',
            timestamp: 'old',
          }),
        ),
      ),
    ).resolves.toEqual({
      success: false,
      error: 'Validation failed',
      timestamp: expect.any(String),
    });
  });
});
