import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
 feat/sprint2-tests
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const response = context
      .switchToHttp()
      .getResponse<{ statusCode: number }>();
 dev

    return next.handle().pipe(
      map((data: unknown) => {
        // 如果已经是标准格式，直接返回
        if (data && typeof data === 'object' && 'success' in data) {
          return {
            ...(data as Record<string, unknown>),
            timestamp: new Date().toISOString(),
          } as ApiResponse<T>;
        }

        // 转换为标准格式
        return {
          success: true,
          data: data as T,
          message: this.getMessageFromStatusCode(response.statusCode),
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private getMessageFromStatusCode(statusCode: number): string {
    switch (statusCode) {
      case 200:
        return 'Request successful';
      case 201:
        return 'Resource created successfully';
      case 204:
        return 'Resource deleted successfully';
      default:
        return 'Operation completed successfully';
    }
  }
}
