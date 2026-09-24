import { validate } from 'class-validator';
import { CreateUserDto } from '../../apps/api-gateway/src/user/dto/create-user.dto';
import { CreateOrderDto } from '../../apps/api-gateway/src/order/dto/create-order.dto';

describe('Gateway DTO validation', () => {
  it('accepts a valid CreateUserDto', async () => {
    const dto = Object.assign(new CreateUserDto(), {
      name: 'Alice',
      email: 'alice@example.com',
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a CreateUserDto with bad email and empty name', async () => {
    const dto = Object.assign(new CreateUserDto(), { name: '', email: 'nope' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('accepts a valid CreateOrderDto', async () => {
    const dto = Object.assign(new CreateOrderDto(), {
      userId: '1',
      product: 'Keyboard',
      quantity: 2,
      price: 49.99,
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a CreateOrderDto with zero quantity and negative price', async () => {
    const dto = Object.assign(new CreateOrderDto(), {
      userId: '1',
      product: 'Keyboard',
      quantity: 0,
      price: -1,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
