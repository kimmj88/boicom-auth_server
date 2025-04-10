import { ExecutionContext, UnauthorizedException, createParamDecorator } from '@nestjs/common';

export const ExtractToken = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  const authHeader = request.headers['authorization'];

  if (!authHeader) {
    throw new UnauthorizedException('Autorization header not provided');
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    throw new UnauthorizedException('Invalid token format');
  }

  return token;
});
