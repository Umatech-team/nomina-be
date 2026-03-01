import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter that unwraps the full `Error.cause` chain so the
 * real underlying error (e.g. the original postgres / drizzle error) is always
 * visible in the logs — not just the outermost wrapper.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Log the full cause chain if there is one
    this.logCauseChain(exception);

    // Delegate HTTP response to the standard Nest behaviour
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response.status(status).json(exception.getResponse());
      return;
    }

    response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      path: request.url,
    });
  }

  private logCauseChain(exception: unknown): void {
    let current: unknown = exception;
    let depth = 0;

    while (current instanceof Error && current.cause) {
      depth++;
      const cause = current.cause as unknown;

      if (cause instanceof Error) {
        this.logger.error(
          `[cause depth=${depth}] ${cause.constructor.name}: ${cause.message}`,
          cause.stack,
        );
      } else {
        this.logger.error(`[cause depth=${depth}]`, String(cause));
      }

      current = cause;
    }
  }
}
