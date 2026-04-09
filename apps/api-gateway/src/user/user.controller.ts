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

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface UserList {
  users: User[];
}

interface CreateUserDto {
  name: string;
  email: string;
}

interface UserServiceGrpc {
  getUser(data: { id: string }): Observable<User>;
  getUsers(data: Record<string, never>): Observable<UserList>;
  createUser(data: CreateUserDto): Observable<User>;
}

@Controller('users')
export class UserController implements OnModuleInit {
  private userService: UserServiceGrpc;

  constructor(@Inject('USER_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.userService =
      this.client.getService<UserServiceGrpc>('UserService');
  }

  @Get()
  async getUsers(): Promise<UserList> {
    return firstValueFrom(this.userService.getUsers({}));
  }

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User> {
    try {
      return await firstValueFrom(this.userService.getUser({ id }));
    } catch (error) {
      throw new HttpException(
        `User with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return firstValueFrom(this.userService.createUser(createUserDto));
  }
}
