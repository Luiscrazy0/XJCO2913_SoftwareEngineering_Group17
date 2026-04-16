import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

const createHost = (
  method: string = 'GET',
  url: string = '/test',
): {
  host: ArgumentsHost;
  response: {
    status: jest.Mock;
    json: jest.Mock;
  };
} => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const response = { status, json };
  const request = { method, url };

  return {
    host: {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost,
    response,
  };
};

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    jest.clearAllMocks();
  });

  it('handles HttpException string responses', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    const { host, response } = createHost('GET', '/forbidden');

    filter.catch(new HttpException('Forbidden', HttpStatus.FORBIDDEN), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(response.status().json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Forbidden',
        statusCode: HttpStatus.FORBIDDEN,
        path: '/forbidden',
      }),
    );
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('handles HttpException object responses', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    const { host, response } = createHost('POST', '/bad-request');

    filter.catch(new BadRequestException('Invalid payload'), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.status().json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Bad Request',
        message: 'Invalid payload',
        statusCode: HttpStatus.BAD_REQUEST,
        path: '/bad-request',
      }),
    );
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('handles regular Error instances', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    const { host, response } = createHost('PATCH', '/boom');

    filter.catch(new Error('Boom'), host);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.status().json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Error',
        message: 'Boom',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        path: '/boom',
      }),
    );
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('falls back to an internal server error for unknown exceptions', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    const { host, response } = createHost('DELETE', '/unknown');

    filter.catch({ reason: 'unknown' }, host);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.status().json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Internal Server Error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        path: '/unknown',
      }),
    );
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
