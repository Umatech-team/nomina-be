import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { UserPresenter } from '../presenters/Player.presenter';
import { FindUserByIdService } from '../services/FindUserById.service';

@ApiTags('User')
@Controller('user')
export class GetUserController {
  constructor(private readonly findUserByIdService: FindUserByIdService) {}

  @Get()
  @HttpCode(statusCode.OK)
  async handle(@CurrentLoggedUser() sub: TokenPayloadSchema) {
    const result = await this.findUserByIdService.execute(sub);

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    const { user } = result.value;

    return UserPresenter.toHTTP(user);
  }
}
