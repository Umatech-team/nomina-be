import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class CategoryHasChildrenError extends Error implements ServiceError {
  statusCode: number = statusCode.CONFLICT;

  constructor() {
    super('Não é possível excluir a categoria pois ela possui subcategorias.');
    this.name = 'CategoryHasChildrenError';
  }
}
