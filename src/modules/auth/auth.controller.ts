import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Response, Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({
    short: { limit: 5, ttl: 60000 },
    long: { limit: 10, ttl: 3600000 },
  })
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    await this.authService.register(registerDto);

    const result = await this.authService.login({
      cpf: registerDto.cpf,
      password: registerDto.password,
    });

    this.setAuthCookies(res, result);

    return res.json({ message: 'User created successfully' });
  }

  @Public()
  @Throttle({
    short: { limit: 5, ttl: 60000 },
    long: { limit: 20, ttl: 3600000 },
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(loginDto);

    this.setAuthCookies(res, result);

    return res.json({ message: 'Login successful' });
  }

  @Public()
  @Throttle({
    short: { limit: 10, ttl: 60000 },
    long: { limit: 50, ttl: 3600000 },
  })
  @Post('check-cpf')
  async checkCpf(@Body('cpf') cpf: string) {
    const user = await this.authService.checkCpf(cpf);

    return { exists: !!user };
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'] as string;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    const result = await this.authService.refresh(refreshToken);

    this.setAuthCookies(res, result);

    return res.json({ message: 'Token refreshed' });
  }

  @Get('me')
  me(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.authService.getMe(user.sub);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const user = req.user as JwtPayload;
    await this.authService.logout(user.sub);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.clearCookie('csrf_token');

    return res.json({ message: 'Logged out successfully' });
  }

  @Post('change-password')
  @Throttle({
    short: { limit: 5, ttl: 60000 },
    long: { limit: 20, ttl: 3600000 },
  })
  async changePassword(
    @Req() req: Request,
    @Body() data: ChangePasswordDto,
    @Res() res: Response,
  ) {
    const user = req.user as JwtPayload;

    const tokens = await this.authService.changePassword(user.sub, data);

    this.setAuthCookies(res, tokens);

    return res.json({ message: 'Password changed successfully' });
  }

  private setAuthCookies(
    res: Response,
    tokens: { access_token: string; refresh_token: string; csrf_token: string },
  ) {
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 15,
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 3600000,
    });

    res.cookie('csrf_token', tokens.csrf_token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 15,
    });
  }
}
