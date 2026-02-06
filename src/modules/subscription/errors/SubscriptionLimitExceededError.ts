import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class SubscriptionLimitExceededError
  extends Error
  implements ServiceError
{
  statusCode: number = statusCode.FORBIDDEN;

  constructor(reason: string = 'Subscription limit exceeded') {
    super(reason);
    this.name = 'SubscriptionLimitExceededError';
  }
}
