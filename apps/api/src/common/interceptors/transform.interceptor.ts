import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export interface Response<T = any> {
  success: boolean;
  data: T;
  meta: {
    timestamp: number;
    path: string;
  };
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        meta: {
          timestamp: Date.now(),
          path: context.switchToHttp().getRequest().url,
        },
      })),
    );
  }
}