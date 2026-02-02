import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, HttpCode, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { statusCode } from '@shared/core/types/statusCode';
import { UpdateSubscriptionDTO } from '../dto/UpdateSubscriptionDTO';
import { UpdateSubscriptionGateway } from '../gateways/UpdateSubscription.gateway';
import { SubscriptionPresenter } from '../presenters/Subscription.presenter';
import { UpdateSubscriptionService } from '../services/UpdateSubscription.service';

@ApiTags('Subscription')
@Controller('subscription')
export class UpdateSubscriptionController {
  constructor(
    private readonly updateSubscriptionService: UpdateSubscriptionService,
  ) {}

  @Patch('update')
  @HttpCode(statusCode.OK)
  @ApiOperation({ summary: 'Update an existing subscription (admin only)' })
  @Roles(UserRole.OWNER)
  async handle(@Body(UpdateSubscriptionGateway) body: UpdateSubscriptionDTO) {
    const result = await this.updateSubscriptionService.execute({
      subscriptionId: body.subscriptionId,
      planId: body.planId,
      status: body.status,
      currentPeriodEnd: body.currentPeriodEnd,
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    return SubscriptionPresenter.toHTTP(result.value.subscription);
  }
}
