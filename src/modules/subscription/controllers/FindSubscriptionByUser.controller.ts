import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { SubscriptionPresenter } from '../presenters/Subscription.presenter';
import { FindSubscriptionByUserService } from '../services/FindSubscriptionByUser.service';

@ApiTags('Subscription')
@Controller('subscription')
export class FindSubscriptionByUserController {
  constructor(
    private readonly findSubscriptionByUserService: FindSubscriptionByUserService,
  ) {}

  @Get('me')
  @HttpCode(statusCode.OK)
  @ApiOperation({ summary: 'Get current user subscription' })
  async handle(@CurrentLoggedUser() { sub }: TokenPayloadSchema) {
    const result = await this.findSubscriptionByUserService.execute({
      userId: sub,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    return SubscriptionPresenter.toHTTP(result.value.subscription);
  }
}
