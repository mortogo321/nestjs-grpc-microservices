import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';

interface OrderService {
  getOrder(data: { id: string }): Observable<any>;
  getOrders(data: Record<string, never>): Observable<any>;
  createOrder(data: {
    userId: string;
    product: string;
    quantity: number;
    price: number;
  }): Observable<any>;
}

@Controller('orders')
export class OrderController implements OnModuleInit {
  private orderService: OrderService;

  constructor(@Inject('ORDER_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.orderService = this.client.getService<OrderService>('OrderService');
  }

  @Get()
  async getOrders() {
    return firstValueFrom(this.orderService.getOrders({}));
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return firstValueFrom(this.orderService.getOrder({ id }));
  }

  @Post()
  async createOrder(
    @Body()
    body: {
      userId: string;
      product: string;
      quantity: number;
      price: number;
    },
  ) {
    return firstValueFrom(this.orderService.createOrder(body));
  }
}