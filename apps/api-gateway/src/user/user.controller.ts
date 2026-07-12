import { Controller, Get, Post, Body, Param, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';

interface UserService {
  getUser(data: { id: string }): Observable<any>;
  getUsers(data: Record<string, never>): Observable<any>;
  createUser(data: { name: string; email: string }): Observable<any>;
}

@Controller('users')
export class UserController implements OnModuleInit {
  private userService!: UserService;

  constructor(@Inject('USER_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<UserService>('UserService');
  }

  @Get()
  async getUsers() {
    return firstValueFrom(this.userService.getUsers({}));
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return firstValueFrom(this.userService.getUser({ id }));
  }

  @Post()
  async createUser(@Body() body: { name: string; email: string }) {
    return firstValueFrom(this.userService.createUser(body));
  }
}
