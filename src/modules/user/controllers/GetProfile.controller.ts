import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { UserPresenter } from '../presenters/User.presenter';
import { GetProfileService } from '../services/GetProfile.service';

@ApiTags('Auth')
@Controller('auth')
export class GetProfileController {
  constructor(private readonly getProfileService: GetProfileService) {}

  @Get('/me')
  @HttpCode(statusCode.OK)
  async handle(@CurrentLoggedUser() sub: TokenPayloadSchema) {
    const result = await this.getProfileService.execute(sub);

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { user } = result.value;

    return UserPresenter.toHTTP(user);
  }
}
