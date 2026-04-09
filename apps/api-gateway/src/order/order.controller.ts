import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  OnModuleInit,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';

interface Order {
  id: string;
  userId: string;
  product: string;
  quantity: number;
  price: number;
  total: number;
  status: string;
  createdAt: string;
}

interface OrderList {
  orders: Order[];
}

interface CreateOrderDto {
  userId: string;
  product: string;
  quantity: number;
  price: number;
}

interface OrderServiceGrpc {
  getOrder(data: { id: string }): Observable<Order>;
  getOrders(data: Record<string, never>): Observable<OrderList>;
  createOrder(data: CreateOrderDto): Observable<Order>;
}

@Controller('orders')
export class OrderController implements OnModuleInit {
  private orderService: OrderServiceGrpc;

  constructor(@Inject('ORDER_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.orderService =
      this.client.getService<OrderServiceGrpc>('OrderService');
  }

  @Get()
  async getOrders(): Promise<OrderList> {
    return firstValueFrom(this.orderService.getOrders({}));
  }

  @Get(':id')
  async getOrder(@Param('id') id: string): Promise<Order> {
    try {
      return await firstValueFrom(this.orderService.getOrder({ id }));
    } catch (error) {
      throw new HttpException(
        `Order with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return firstValueFrom(this.orderService.createOrder(createOrderDto));
  }
}
