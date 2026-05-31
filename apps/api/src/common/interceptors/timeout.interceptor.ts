import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, timeout } from 'rxjs';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly defaultTimeout: number = 30000) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const timeoutValue =
      context.switchToHttp().getRequest().headers['x-request-timeout'] ||
      this.defaultTimeout;
    return next.handle().pipe(timeout(Number(timeoutValue) || this.defaultTimeout));
  }
}