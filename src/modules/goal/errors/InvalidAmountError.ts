import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class InvalidAmountError extends Error implements ServiceError {
  statusCode: number = statusCode.BAD_REQUEST;

  constructor() {
    super('O valor da transação deve ser maior que zero.');
  }
}
