import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class SessionExpiredError extends Error implements ServiceError {
  statusCode: number = statusCode.FORBIDDEN;

  constructor() {
    super('Token Inválido');
  }
}
