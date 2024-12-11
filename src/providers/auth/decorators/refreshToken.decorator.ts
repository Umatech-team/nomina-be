import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RefreshToken = createParamDecorator(
  (_: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.headers.refresh_token as string;
    return refreshToken;
  },
);
