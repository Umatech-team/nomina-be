import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { UserPresenter } from '@modules/user/presenters/user.presenter';
import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { type TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { GetProfileHandler } from './get-profile.handler';

@ApiTags('Auth')
@Controller('auth')
export class GetProfileController {
  constructor(private readonly handler: GetProfileHandler) {}

  @Get('/me')
  @HttpCode(statusCode.OK)
  async handle(@CurrentLoggedUser() sub: TokenPayloadSchema) {
    const data = await this.handler.execute(sub);

    if (data.isLeft()) {
      return ErrorPresenter.toHTTP(data.value);
    }

    return { data: UserPresenter.toHTTP(data.value) };
  }
}
