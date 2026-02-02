import { SubscriptionStatus } from '@constants/enums';
import { Injectable } from '@nestjs/common';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { Subscription } from '../entities/Subscription';
import { SubscriptionNotFoundError } from '../errors/SubscriptionNotFoundError';
import { SubscriptionRepository } from '../repositories/contracts/SubscriptionRepository';

interface Request {
  subscriptionId: string;
  status?: SubscriptionStatus;
  currentPeriodEnd?: Date;
  planId?: string;
}

type Errors = SubscriptionNotFoundError;

interface Response {
  subscription: Subscription;
}

@Injectable()
export class UpdateSubscriptionService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async execute(data: Request): Promise<Either<Errors, Response>> {
    const subscription = await this.subscriptionRepository.findById(
      data.subscriptionId,
    );

    if (!subscription) {
      return left(new SubscriptionNotFoundError());
    }

    // Atualizar campos opcionais
    if (data.status) subscription.status = data.status;
    if (data.currentPeriodEnd)
      subscription.currentPeriodEnd = data.currentPeriodEnd;
    if (data.planId) subscription.planId = data.planId;

    const updatedSubscription =
      await this.subscriptionRepository.update(subscription);

    return right({ subscription: updatedSubscription });
  }
}
