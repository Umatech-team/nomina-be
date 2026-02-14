import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class InviteAlreadyUsedError extends Error implements ServiceError {
  statusCode: number = statusCode.BAD_REQUEST;

  constructor() {
    super('Convite já foi utilizado');
    this.name = 'InviteAlreadyUsedError';
  }
}
