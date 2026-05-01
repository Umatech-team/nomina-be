import { ErrorPresenter } from '@infra/presenters/ErrorPresenter';
import { UserPresenter } from '@modules/user/presenters/user.presenter';
import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { GetProfileService } from './get-profile.service';

@ApiTags('Auth')
@Controller('auth')
export class GetProfileController {
  constructor(private readonly service: GetProfileService) {}

  @Get('/me')
  @HttpCode(statusCode.OK)
  async handle(@CurrentLoggedUser() sub: TokenPayloadSchema) {
    const data = await this.service.execute(sub);

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return { data: UserPresenter.toHTTP(data.value) };
  }
}
