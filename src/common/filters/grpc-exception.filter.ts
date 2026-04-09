import { Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { Observable, throwError } from 'rxjs';

const HTTP_TO_GRPC_STATUS: Record<number, number> = {
  [HttpStatus.BAD_REQUEST]: GrpcStatus.INVALID_ARGUMENT,
  [HttpStatus.UNAUTHORIZED]: GrpcStatus.UNAUTHENTICATED,
  [HttpStatus.FORBIDDEN]: GrpcStatus.PERMISSION_DENIED,
  [HttpStatus.NOT_FOUND]: GrpcStatus.NOT_FOUND,
  [HttpStatus.CONFLICT]: GrpcStatus.ALREADY_EXISTS,
  [HttpStatus.TOO_MANY_REQUESTS]: GrpcStatus.RESOURCE_EXHAUSTED,
  [HttpStatus.INTERNAL_SERVER_ERROR]: GrpcStatus.INTERNAL,
  [HttpStatus.NOT_IMPLEMENTED]: GrpcStatus.UNIMPLEMENTED,
  [HttpStatus.SERVICE_UNAVAILABLE]: GrpcStatus.UNAVAILABLE,
  [HttpStatus.GATEWAY_TIMEOUT]: GrpcStatus.DEADLINE_EXCEEDED,
};

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GrpcExceptionFilter.name);

  catch(exception: unknown): Observable<never> {
    let grpcCode = GrpcStatus.INTERNAL;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      const httpStatus = exception.getStatus();
      grpcCode = HTTP_TO_GRPC_STATUS[httpStatus] ?? GrpcStatus.INTERNAL;
      message = exception.message;
    } else if (exception instanceof RpcException) {
      const error = exception.getError();
      if (typeof error === 'object' && error !== null && 'code' in error) {
        grpcCode = (error as { code: number }).code;
      }
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `gRPC Exception - Code: ${grpcCode}, Message: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    return throwError(() => ({
      code: grpcCode,
      message,
    }));
  }
}
