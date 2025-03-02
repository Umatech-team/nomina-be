import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class InsufficientBalanceError extends Error implements ServiceError {
  statusCode: number = statusCode.CONFLICT;

  constructor() {
    super('Saldo insuficiente para realizar esta ação.');
  }
}
