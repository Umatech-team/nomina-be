import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@providers/auth/decorators/IsPublic.decorator';
import { statusCode } from '@shared/core/types/statusCode';
import { LoginUserPipe, LoginUserRequest } from './login-user.dto';
import { LoginUserHandler } from './login-user.handler';

@ApiTags('Auth')
@Controller('auth')
export class LoginUserController {
  constructor(private readonly handler: LoginUserHandler) {}

  @Public()
  @Post('login')
  @HttpCode(statusCode.OK)
  async handle(@Body(LoginUserPipe) body: LoginUserRequest) {
    const data = await this.handler.execute(body);

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return { data: data.value };
  }
}
