import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class ConflictAccountError extends Error implements ServiceError {
  statusCode: number = statusCode.CONFLICT;

  constructor(reason: string) {
    super(`Não foi possível criar a conta: ${reason}`);
    this.name = 'ConflictAccountError';
  }
}
