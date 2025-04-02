import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@providers/auth/decorators/IsPublic.decorator';
import { RefreshToken } from '@providers/auth/decorators/refreshToken.decorator';
import { statusCode } from '@shared/core/types/statusCode';
import { TokensPresenter } from '../presenters/Tokens.presenter';
import { RefreshTokenService } from '../services/RefreshToken.service';

@ApiTags('Auth')
@Controller('refresh_token')
export class RefreshTokenController {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  @Public()
  @Get()
  @HttpCode(statusCode.OK)
  async handle(@RefreshToken() refreshToken: string) {
    console.log('refreshToken', refreshToken);
    const result = await this.refreshTokenService.execute(refreshToken);

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    return TokensPresenter.toHTTP(result.value);
  }
}
