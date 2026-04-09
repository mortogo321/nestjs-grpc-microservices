import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { OrderController } from './order.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ORDER_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'order',
          protoPath: join(process.cwd(), 'proto/order.proto'),
          url: process.env.ORDER_SERVICE_URL || 'localhost:5002',
        },
      },
    ]),
  ],
  controllers: [OrderController],
})
export class OrderModule {}
