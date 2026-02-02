import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class ConflictCategoryError extends Error implements ServiceError {
  statusCode: number = statusCode.CONFLICT;

  constructor(reason: string) {
    super(`Conflito na operação de categoria: ${reason}`);
    this.name = 'ConflictCategoryError';
  }
}
