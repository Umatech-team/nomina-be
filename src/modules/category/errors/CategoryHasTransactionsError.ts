import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class CategoryHasTransactionsError
  extends Error
  implements ServiceError
{
  statusCode: number = statusCode.CONFLICT;

  constructor() {
    super(
      'Não é possível excluir a categoria pois ela possui transações vinculadas.',
    );
    this.name = 'CategoryHasTransactionsError';
  }
}
