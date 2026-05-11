import { RequestIdMiddleware } from './request-id.middleware';

type MiddlewareRequest = Parameters<RequestIdMiddleware['use']>[0] & {
  requestId?: string;
};
type MiddlewareResponse = Parameters<RequestIdMiddleware['use']>[1];

describe('RequestIdMiddleware', () => {
  it('reuses an incoming request id header', () => {
    const middleware = new RequestIdMiddleware();
    const req = {
      headers: { 'x-request-id': 'request-123' },
    } as unknown as MiddlewareRequest;
    const setHeader = jest.fn();
    const res = { setHeader } as unknown as MiddlewareResponse;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.requestId).toBe('request-123');
    expect(setHeader).toHaveBeenCalledWith('x-request-id', 'request-123');
    expect(next).toHaveBeenCalled();
  });

  it('generates a request id when the header is absent', () => {
    const middleware = new RequestIdMiddleware();
    const req = { headers: {} } as unknown as MiddlewareRequest;
    const setHeader = jest.fn();
    const res = { setHeader } as unknown as MiddlewareResponse;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.requestId).toEqual(expect.any(String));
    expect(setHeader).toHaveBeenCalledWith('x-request-id', req.requestId);
    expect(next).toHaveBeenCalled();
  });
});
