import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../apps/api-gateway/src/user/user.controller';
import { of } from 'rxjs';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    getUsers: jest.fn(),
    getUser: jest.fn(),
    createUser: jest.fn(),
  };

  const mockGrpcClient = {
    getService: jest.fn().mockReturnValue(mockUserService),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: 'USER_PACKAGE',
          useValue: mockGrpcClient,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    controller.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /users', () => {
    it('should return a list of users', async () => {
      const expectedUsers = {
        users: [
          { id: '1', name: 'John Doe', email: 'john@example.com', createdAt: '2024-01-01' },
          { id: '2', name: 'Jane Doe', email: 'jane@example.com', createdAt: '2024-01-02' },
        ],
      };
      mockUserService.getUsers.mockReturnValue(of(expectedUsers));

      const result = await controller.getUsers();

      expect(result).toEqual(expectedUsers);
      expect(mockUserService.getUsers).toHaveBeenCalledWith({});
    });
  });

  describe('GET /users/:id', () => {
    it('should return a single user by id', async () => {
      const expectedUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: '2024-01-01',
      };
      mockUserService.getUser.mockReturnValue(of(expectedUser));

      const result = await controller.getUser('1');

      expect(result).toEqual(expectedUser);
      expect(mockUserService.getUser).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const createUserDto = { name: 'New User', email: 'new@example.com' };
      const expectedUser = { id: '3', ...createUserDto, createdAt: '2024-01-03' };
      mockUserService.createUser.mockReturnValue(of(expectedUser));

      const result = await controller.createUser(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(mockUserService.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });
});
