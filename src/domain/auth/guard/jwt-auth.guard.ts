import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { MicrosoftAuthService } from '@domain/auth/service/microsoft-auth.service';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly microsoftAuthService: MicrosoftAuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const accessToken = this.getBearerToken(request);

    if (!accessToken) {
      throw new UnauthorizedException('Token not provided');
    }

    const isValid = await this.microsoftAuthService.validateToken(accessToken);

    if (!isValid) {
      throw new UnauthorizedException('Token is invalid or expired');
    }

    return true;
  }

  private getBearerToken(reuest: Request): string | null {
    const authHeader = reuest.headers['authorization'];
    if (!authHeader) {
      return null;
    }
    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}
