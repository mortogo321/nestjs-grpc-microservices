import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { UserModule } from './user.module';
import { GrpcExceptionFilter } from '../../../src/common/filters/grpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(UserModule, {
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: join(process.cwd(), 'proto/user.proto'),
      url: '0.0.0.0:5001',
    },
  });

  app.useGlobalFilters(new GrpcExceptionFilter());

  await app.listen();
  console.log('User Service is listening on port 5001 (gRPC)');
}

bootstrap();
