import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async update(id: Types.ObjectId | string, data: UpdateUserDto) {
    const [existingPhone, currentUser] = await Promise.all([
      this.existsByPhone(data.phone!),
      this.getProfile(id),
    ]);

    if (existingPhone && data.phone !== currentUser.user.phone)
      throw new BadRequestException('Phone already exists');

    return await this.usersRepository.update(id, data);
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

  async existsByPhone(phone: string) {
    return !!(await this.usersRepository.existsByPhone(phone));
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

  async getProfile(id: string | Types.ObjectId) {
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
