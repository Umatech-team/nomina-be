import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class CannotRemoveOwnerError extends Error implements ServiceError {
  statusCode: number = statusCode.BAD_REQUEST;

  constructor() {
    super('Não é possível remover o proprietário do workspace');
  }
}
