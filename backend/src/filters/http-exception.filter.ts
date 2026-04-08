import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponse {
  success: boolean;
  error: string;
  message?: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        error = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        error = responseObj.error || exception.name;
        message = responseObj.message || exception.message;
      }
    } else if (exception instanceof Error) {
      error = exception.name;
      message = exception.message;
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error,
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // 记录错误日志（生产环境应该使用日志服务）
    console.error(`[${new Date().toISOString()}] ${request.method} ${request.url}`, {
      status,
      error,
      message,
      exception: exception instanceof Error ? exception.stack : exception,
    });

    response.status(status).json(errorResponse);
  }
}