import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@providers/auth/decorators/IsPublic.decorator';
import { RefreshToken } from '@providers/auth/decorators/refreshToken.decorator';
import { statusCode } from '@shared/core/types/statusCode';
import { RefreshTokenHandler } from './refresh-token.handler';

@ApiTags('Auth')
@Controller('auth')
export class RefreshTokenController {
  constructor(private readonly handler: RefreshTokenHandler) {}

  @Public()
  @Get('/session/refresh')
  @HttpCode(statusCode.OK)
  async handle(@RefreshToken() refreshToken: string) {
    const data = await this.handler.execute(refreshToken);

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return { data: data.value };
  }
}
