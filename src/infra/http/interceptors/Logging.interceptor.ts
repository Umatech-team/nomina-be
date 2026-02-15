import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

/**
 * Global HTTP Logging Interceptor
 *
 * Monitors all HTTP requests and logs:
 * - HTTP Method & URL
 * - Response status code
 * - Execution time (ms)
 *
 * Performance indicators:
 * - ✅ GREEN (OK): < 300ms
 * - ⚠️ YELLOW (WARN): 300-999ms
 * - ❌ RED (CRITICAL): >= 1000ms
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        const statusCode = response.statusCode;

        this.logRequest(method, url, statusCode, executionTime);
      }),
      catchError((error) => {
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        const statusCode = error.status || 500;

        this.logRequest(method, url, statusCode, executionTime);

        return throwError(() => error);
      }),
    );
  }

  private logRequest(
    method: string,
    url: string,
    statusCode: number,
    executionTime: number,
  ): void {
    const { color, icon, label } = this.getPerformanceIndicator(executionTime);
    const statusColor = this.getStatusColor(statusCode);
    const reset = '\x1b[0m';

    const logMessage = `${color}${icon} ${label} [${executionTime}ms]${reset} ${method} ${url} ${statusColor}→ ${statusCode}${reset}`;

    if (executionTime >= 1000) {
      console.error(logMessage);
    } else if (executionTime >= 300) {
      console.warn(logMessage);
    } else {
      console.log(logMessage);
    }
  }

  private getPerformanceIndicator(executionTime: number): {
    color: string;
    icon: string;
    label: string;
  } {
    if (executionTime >= 1000) {
      return {
        color: '\x1b[31m', // Red
        icon: '❌',
        label: 'CRITICAL',
      };
    } else if (executionTime >= 300) {
      return {
        color: '\x1b[33m', // Yellow
        icon: '⚠️',
        label: 'WARN',
      };
    } else {
      return {
        color: '\x1b[32m', // Green
        icon: '✅',
        label: 'OK',
      };
    }
  }

  private getStatusColor(statusCode: number): string {
    if (statusCode >= 500) {
      return '\x1b[31m'; // Red for server errors
    } else if (statusCode >= 400) {
      return '\x1b[33m'; // Yellow for client errors
    } else if (statusCode >= 300) {
      return '\x1b[36m'; // Cyan for redirects
    } else if (statusCode >= 200) {
      return '\x1b[32m'; // Green for success
    }
    return '\x1b[37m'; // White for other
  }
}
