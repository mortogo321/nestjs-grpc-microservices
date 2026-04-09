import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface GetUserRequest {
  id: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
}

@Controller()
export class UserController {
  private readonly users: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      createdAt: new Date().toISOString(),
    },
  ];

  private nextId = 3;

  @GrpcMethod('UserService', 'GetUser')
  getUser(data: GetUserRequest): User {
    const user = this.users.find((u) => u.id === data.id);
    if (!user) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: `User with id ${data.id} not found`,
      });
    }
    return user;
  }

  @GrpcMethod('UserService', 'GetUsers')
  getUsers(): { users: User[] } {
    return { users: this.users };
  }

  @GrpcMethod('UserService', 'CreateUser')
  createUser(data: CreateUserRequest): User {
    const user: User = {
      id: String(this.nextId++),
      name: data.name,
      email: data.email,
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }
}
