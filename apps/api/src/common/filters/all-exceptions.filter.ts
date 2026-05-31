import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  path: string;
  timestamp: string;
  errorId: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;

    const errorId = crypto.randomUUID();

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message:
        exception.message?.message || exception.message || 'Internal server error',
      path: request.url,
      timestamp: new Date().toISOString(),
      errorId,
    };

    // Log detailed error for server-side
    this.logger.error(
      `Error ${errorId}: ${exception?.message}`,
      exception?.stack,
    );

    // Don't leak internal errors in production
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      errorResponse.message = 'Internal server error';
      if (process.env.NODE_ENV !== 'development') {
        // Log to external error tracking service here (Sentry, etc.)
      }
    }

    response.status(status).json({
      success: false,
      error: errorResponse,
    });
  }
}