import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { status as GrpcStatus } from '@grpc/grpc-js';

const DEFAULT_TIMEOUT_MS = 5000;

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly timeoutMs: number = DEFAULT_TIMEOUT_MS) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () =>
              new RpcException({
                code: GrpcStatus.DEADLINE_EXCEEDED,
                message: `Request timed out after ${this.timeoutMs}ms`,
              }),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
