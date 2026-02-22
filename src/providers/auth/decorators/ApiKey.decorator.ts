import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const ApiKey = createParamDecorator(
  (_: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.headers['x-api-key'];
  },
);
