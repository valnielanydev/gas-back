import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { Types } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  create(data: CreateUserDto) {
    return this.usersRepository.create(data);
  }

  update(id: Types.ObjectId | string, data: UpdateUserDto) {
    return this.usersRepository.update(id, data);
  }

  findByCpfWithPassword(cpf: string) {
    return this.usersRepository.findByCpfWithPassword(cpf);
  }

  findByIdWithPassword(id: string) {
    return this.usersRepository.findByIdWithPassword(id);
  }

  findByIdWithRefreshToken(id: string) {
    return this.usersRepository.findByIdWithRefreshToken(id);
  }

  async existsByCpf(cpf: string) {
    return !!(await this.usersRepository.existsByCpf(cpf));
  }

  changePassword(id: Types.ObjectId | string, data: UpdateUserDto) {
    return this.usersRepository.update(id, data);
  }

  updateRefreshToken(id: Types.ObjectId | string, refreshToken: string | null) {
    return this.usersRepository.updateRefreshToken(id, refreshToken);
  }

  async getProfile(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');

    return {
      user: {
        id: user._id.toString(),
        cpf: user.cpf,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
      roles: [user.role],
      resellerId: user.resellerId ?? null,
    };
  }
}
