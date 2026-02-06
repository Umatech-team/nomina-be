import { Injectable } from '@nestjs/common';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { Subscription } from '../entities/Subscription';
import { SubscriptionNotFoundError } from '../errors/SubscriptionNotFoundError';
import { SubscriptionRepository } from '../repositories/contracts/SubscriptionRepository';

interface Request {
  userId: string;
}

type Errors = SubscriptionNotFoundError;

interface Response {
  subscription: Subscription;
}

@Injectable()
export class FindSubscriptionByUserService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async execute({ userId }: Request): Promise<Either<Errors, Response>> {
    const subscription = await this.subscriptionRepository.findByUserId(userId);

    if (!subscription) {
      return left(
        new SubscriptionNotFoundError(
          'Nenhuma subscription encontrada para o usuário',
        ),
      );
    }

    return right({ subscription });
  }
}
