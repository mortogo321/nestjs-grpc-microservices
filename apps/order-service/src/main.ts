import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { OrderModule } from './order.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrderModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'order',
        protoPath: join(process.cwd(), 'proto/order.proto'),
        url: '0.0.0.0:5002',
      },
    },
  );

  await app.listen();
  Logger.log('Order Service is listening on gRPC port 5002', 'Bootstrap');
}

bootstrap();
