import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class RecurringTransactionNotFoundError
  extends Error
  implements ServiceError
{
  statusCode: number = statusCode.NOT_FOUND;

  constructor() {
    super('Transação recorrente não encontrada ou não existe');
  }
}
