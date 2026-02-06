import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class SubscriptionNotFoundError extends Error implements ServiceError {
  statusCode: number = statusCode.NOT_FOUND;

  constructor(reason: string = 'Subscription não encontrada') {
    super(reason);
    this.name = 'SubscriptionNotFoundError';
  }
}
