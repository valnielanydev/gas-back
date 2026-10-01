import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(Users.name) private usersModel: Model<Users>) {}

  create(data: CreateUserDto) {
    return this.usersModel.create(data);
  }

  update(id: Types.ObjectId | string, data: UpdateUserDto) {
    return this.usersModel.updateOne({ _id: id }, data);
  }

  findByCpf(cpf: string) {
    return this.usersModel.findOne({ cpf });
  }

  findByCpfWithPassword(cpf: string) {
    return this.usersModel.findOne({ cpf }).select('+password');
  }

  findByIdWithPassword(id: Types.ObjectId | string) {
    return this.usersModel.findOne({ _id: id }).select('+password');
  }

  findById(id: Types.ObjectId | string) {
    return this.usersModel.findById(id);
  }

  findByIdWithRefreshToken(id: string) {
    return this.usersModel.findById(id).select('+refreshToken');
  }

  existsByCpf(cpf: string) {
    return this.usersModel.exists({ cpf });
  }

  existsByPhone(phone: string) {
    return this.usersModel.exists({ phone });
  }

  updateRefreshToken(id: Types.ObjectId | string, refreshToken: string | null) {
    return this.usersModel.findByIdAndUpdate(id, { refreshToken });
  }
}
