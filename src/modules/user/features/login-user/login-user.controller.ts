import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@providers/auth/decorators/IsPublic.decorator';
import { statusCode } from '@shared/core/types/statusCode';
import { LoginUserPipe, type LoginUserRequest } from './login-user.dto';
import { LoginUserService } from './login-user.service';

@ApiTags('Auth')
@Controller('auth')
export class LoginUserController {
  constructor(private readonly service: LoginUserService) {}

  @Public()
  @Post('login')
  @HttpCode(statusCode.OK)
  async handle(@Body(LoginUserPipe) body: LoginUserRequest) {
    const data = await this.service.execute(body);

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return { data: data.value };
  }
}
