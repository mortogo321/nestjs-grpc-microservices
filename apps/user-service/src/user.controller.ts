import { Controller, NotFoundException } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

@Controller()
export class UserController {
  private readonly users: User[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      createdAt: new Date().toISOString(),
    },
  ];

  @GrpcMethod('UserService', 'GetUser')
  getUser(data: { id: string }): User {
    const user = this.users.find((u) => u.id === data.id);
    if (!user) {
      throw new NotFoundException(`User with id ${data.id} not found`);
    }
    return user;
  }

  @GrpcMethod('UserService', 'GetUsers')
  getUsers(): { users: User[] } {
    return { users: this.users };
  }

  @GrpcMethod('UserService', 'CreateUser')
  createUser(data: { name: string; email: string }): User {
    const user: User = {
      id: randomUUID(),
      name: data.name,
      email: data.email,
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }
}
