import { SubscriptionStatus } from '@constants/enums';
import { Injectable } from '@nestjs/common';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { Subscription } from '../entities/Subscription';
import { SubscriptionAlreadyExistsError } from '../errors/SubscriptionAlreadyExistsError';
import { SubscriptionRepository } from '../repositories/contracts/SubscriptionRepository';

interface Request {
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
}

type Errors = SubscriptionAlreadyExistsError;

interface Response {
  subscription: Subscription;
}

@Injectable()
export class CreateSubscriptionService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async execute(data: Request): Promise<Either<Errors, Response>> {
    // 1. Verificar se já existe subscription ativa para o usuário
    const existing = await this.subscriptionRepository.findByUserId(
      data.userId,
    );

    if (existing && existing.status === SubscriptionStatus.ACTIVE) {
      return left(
        new SubscriptionAlreadyExistsError(
          'Usuário já possui subscription ativa',
        ),
      );
    }

    // 2. Criar entity
    const subscription = new Subscription({
      userId: data.userId,
      planId: data.planId,
      status: data.status,
      currentPeriodEnd: data.currentPeriodEnd,
    });

    // 3. Persistir
    const createdSubscription =
      await this.subscriptionRepository.create(subscription);

    return right({ subscription: createdSubscription });
  }
}
