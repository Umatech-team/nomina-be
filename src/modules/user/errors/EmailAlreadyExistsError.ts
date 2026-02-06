import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class EmailAlreadyExistsError extends Error implements ServiceError {
  statusCode: number = statusCode.CONFLICT;

  constructor() {
    super('Já existe mesmo e-mail cadastrado no sistema');
  }
}
