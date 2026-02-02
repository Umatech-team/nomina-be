import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class SubscriptionAlreadyExistsError
  extends Error
  implements ServiceError
{
  statusCode: number = statusCode.CONFLICT;

  constructor(reason: string = 'Usuário já possui subscription ativa') {
    super(reason);
    this.name = 'SubscriptionAlreadyExistsError';
  }
}
