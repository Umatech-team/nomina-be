import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class SystemCategoryCannotBeModifiedError
  extends Error
  implements ServiceError
{
  statusCode: number = statusCode.FORBIDDEN;

  constructor() {
    super('Categorias do sistema não podem ser modificadas ou excluídas.');
    this.name = 'SystemCategoryCannotBeModifiedError';
  }
}
