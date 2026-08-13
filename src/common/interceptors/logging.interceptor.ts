import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const contextType = context.getType();
    const className = context.getClass().name;
    const methodName = context.getHandler().name;
    const now = Date.now();

    let metadata = '';
    if (contextType === 'rpc') {
      const rpcContext = context.switchToRpc();
      const grpcMetadata = rpcContext.getContext();
      if (grpcMetadata?.getMap) {
        const metadataMap = grpcMetadata.getMap();
        metadata = Object.keys(metadataMap).length
          ? ` | Metadata: ${JSON.stringify(metadataMap)}`
          : '';
      }
    }

    this.logger.log(`[${contextType}] ${className}.${methodName} - Incoming request${metadata}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - now;
          this.logger.log(
            `[${contextType}] ${className}.${methodName} - Completed in ${duration}ms`,
          );
        },
        error: (error: Error) => {
          const duration = Date.now() - now;
          this.logger.error(
            `[${contextType}] ${className}.${methodName} - Failed in ${duration}ms: ${error.message}`,
          );
        },
      }),
    );
  }
}
