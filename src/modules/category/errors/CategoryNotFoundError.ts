import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class CategoryNotFoundError extends Error implements ServiceError {
  statusCode: number = statusCode.NOT_FOUND;

  constructor() {
    super('Categoria não encontrada.');
    this.name = 'CategoryNotFoundError';
  }
}
