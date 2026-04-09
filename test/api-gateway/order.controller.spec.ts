import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from '../../apps/api-gateway/src/order/order.controller';
import { of } from 'rxjs';

describe('OrderController', () => {
  let controller: OrderController;

  const mockOrderService = {
    getOrders: jest.fn(),
    getOrder: jest.fn(),
    createOrder: jest.fn(),
  };

  const mockGrpcClient = {
    getService: jest.fn().mockReturnValue(mockOrderService),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: 'ORDER_PACKAGE',
          useValue: mockGrpcClient,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    controller.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /orders', () => {
    it('should return a list of orders', async () => {
      const expectedOrders = {
        orders: [
          {
            id: '1',
            userId: 'user-1',
            product: 'Widget',
            quantity: 2,
            price: 29.99,
            status: 'pending',
            createdAt: '2024-01-01',
          },
          {
            id: '2',
            userId: 'user-2',
            product: 'Gadget',
            quantity: 1,
            price: 49.99,
            status: 'completed',
            createdAt: '2024-01-02',
          },
        ],
      };
      mockOrderService.getOrders.mockReturnValue(of(expectedOrders));

      const result = await controller.getOrders();

      expect(result).toEqual(expectedOrders);
      expect(mockOrderService.getOrders).toHaveBeenCalledWith({});
    });
  });

  describe('GET /orders/:id', () => {
    it('should return a single order by id', async () => {
      const expectedOrder = {
        id: '1',
        userId: 'user-1',
        product: 'Widget',
        quantity: 2,
        price: 29.99,
        status: 'pending',
        createdAt: '2024-01-01',
      };
      mockOrderService.getOrder.mockReturnValue(of(expectedOrder));

      const result = await controller.getOrder('1');

      expect(result).toEqual(expectedOrder);
      expect(mockOrderService.getOrder).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('POST /orders', () => {
    it('should create a new order', async () => {
      const createOrderDto = {
        userId: 'user-1',
        product: 'New Product',
        quantity: 3,
        price: 19.99,
      };
      const expectedOrder = {
        id: '3',
        ...createOrderDto,
        status: 'pending',
        createdAt: '2024-01-03',
      };
      mockOrderService.createOrder.mockReturnValue(of(expectedOrder));

      const result = await controller.createOrder(createOrderDto);

      expect(result).toEqual(expectedOrder);
      expect(mockOrderService.createOrder).toHaveBeenCalledWith(createOrderDto);
    });
  });
});
