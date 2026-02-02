import { UserRole } from '@constants/enums';
import { ErrorPresenter } from '@infra/presenters/Error.presenter';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentLoggedUser } from '@providers/auth/decorators/CurrentLoggedUser.decorator';
import { Roles } from '@providers/auth/decorators/Roles.decorator';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { statusCode } from '@shared/core/types/statusCode';
import { CreateSubscriptionDTO } from '../dto/CreateSubscriptionDTO';
import { CreateSubscriptionGateway } from '../gateways/CreateSubscription.gateway';
import { SubscriptionPresenter } from '../presenters/Subscription.presenter';
import { CreateSubscriptionService } from '../services/CreateSubscription.service';

@ApiTags('Subscription')
@Controller('subscription')
export class CreateSubscriptionController {
  constructor(
    private readonly createSubscriptionService: CreateSubscriptionService,
  ) {}

  @Post('create')
  @HttpCode(statusCode.CREATED)
  @ApiOperation({ summary: 'Create a new subscription (admin only)' })
  @Roles(UserRole.OWNER)
  async handle(
    @Body(CreateSubscriptionGateway) body: CreateSubscriptionDTO,
    @CurrentLoggedUser() { sub }: TokenPayloadSchema,
  ) {
    const result = await this.createSubscriptionService.execute({
      ...body,
      userId: sub, // Criar para o usuário logado
    });

    if (result.isLeft()) {
      return ErrorPresenter.toHTTP(result.value);
    }

    return SubscriptionPresenter.toHTTP(result.value.subscription);
  }
}
