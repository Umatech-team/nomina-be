import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class InviteExpiredError extends Error implements ServiceError {
  statusCode: number = statusCode.BAD_REQUEST;

  constructor() {
    super('Convite expirado');
    this.name = 'InviteExpiredError';
  }
}
