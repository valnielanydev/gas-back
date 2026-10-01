import { Controller, Body, Patch, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import type { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  async me(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    const user = req.user as JwtPayload;

    await this.usersService.update(user.sub, updateUserDto);

    return { message: 'updated data' };
  }
}
