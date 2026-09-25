import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.existsByCpf(registerDto.cpf);

    if (existingUser) {
      throw new ConflictException('User with this CPF already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    return this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByCpfWithPassword(loginDto.cpf);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateTokens({
      sub: user._id.toString(),
      email: user.email,
      role: 'user',
    });

    await this.usersService.updateRefreshToken(
      user._id,
      await bcrypt.hash(tokens.refresh_token, 10),
    );

    return tokens;
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findByIdWithRefreshToken(payload.sub);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const refreshTokenMatch = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = this.generateTokens({
      sub: user._id.toString(),
      email: user.email,
      role: 'user',
    });

    await this.usersService.updateRefreshToken(
      user._id,
      await bcrypt.hash(tokens.refresh_token, 10),
    );

    return tokens;
  }

  async getMe(userId: string) {
    return await this.usersService.getProfile(userId);
  }

  logout(userId: string) {
    return this.usersService.updateRefreshToken(
      new Types.ObjectId(userId),
      null,
    );
  }

  checkCpf(cpf: string) {
    return this.usersService.existsByCpf(cpf);
  }

  async changePassword(userId: string, data: ChangePasswordDto) {
    const user = await this.usersService.findByIdWithPassword(userId);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(
      data.currentPassword,
      user.password,
    );

    if (!passwordMatch)
      throw new BadRequestException('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await this.usersService.update(userId, { password: hashedPassword });

    const tokens = this.generateTokens({
      sub: user._id.toString(),
      email: user.email,
      role: 'user',
    });

    await this.usersService.updateRefreshToken(
      user._id,
      await bcrypt.hash(tokens.refresh_token, 10),
    );

    return tokens;
  }

  private generateTokens(payload: JwtPayload) {
    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });
    const csrf_token = randomUUID();
    return { access_token, refresh_token, csrf_token };
  }
}
