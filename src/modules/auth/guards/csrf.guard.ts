import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest<Request>();
    const method = req.method;

    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return true;

    const cookies = req.cookies as Record<string, string>;
    const fromCookie = cookies['csrf_token'];
    const fromHeader = req.headers['x-csrf-token'];

    if (!fromCookie || fromCookie !== fromHeader) {
      throw new UnauthorizedException('Invalid CSRF token');
    }

    return true;
  }
}
