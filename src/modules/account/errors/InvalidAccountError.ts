import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class InvalidAccountError extends Error implements ServiceError {
  statusCode: number = statusCode.BAD_REQUEST;

  constructor(reason: string) {
    super(`Não foi possível criar a conta: ${reason}`);
    this.name = 'InvalidAccountError';
  }
}
