import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '@providers/auth/decorators/IsPublic.decorator';
import { RefreshToken } from '@providers/auth/decorators/refreshToken.decorator';
import { statusCode } from '@shared/core/types/statusCode';
import { RefreshTokenService } from './refresh-token.service';

@ApiTags('Auth')
@Controller('auth')
export class RefreshTokenController {
  constructor(private readonly service: RefreshTokenService) {}

  @Public()
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  @Get('/session/refresh')
  @HttpCode(statusCode.OK)
  async handle(@RefreshToken() refreshToken: string) {
    const data = await this.service.execute(refreshToken);

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return { data: data.value };
  }
}
