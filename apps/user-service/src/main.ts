import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { UserModule } from './user.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(UserModule, {
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: join(process.cwd(), 'proto/user.proto'),
      url: '0.0.0.0:5001',
    },
  });

  await app.listen();
  console.log('User Service is listening on port 5001 (gRPC)');
}

bootstrap();
