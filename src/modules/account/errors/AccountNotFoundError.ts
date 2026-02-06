import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class AccountNotFoundError extends Error implements ServiceError {
  statusCode: number = statusCode.NOT_FOUND;

  constructor(reason: string) {
    super(`Conta não encontrada: ${reason}`);
    this.name = 'AccountNotFoundError';
  }
}
