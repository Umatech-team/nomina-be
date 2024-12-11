import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class UnauthorizedError extends Error implements ServiceError {
  statusCode: number = statusCode.FORBIDDEN;

  constructor() {
    super('Você não possui permissão para executar essa ação');
  }
}
