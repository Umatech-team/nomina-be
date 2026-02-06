import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class InvalidWorkspaceError extends Error implements ServiceError {
  statusCode: number = statusCode.BAD_REQUEST;

  constructor(reason: string) {
    super(`Não foi possível criar o espaço: ${reason}`);
    this.name = 'InvalidWorkspaceError';
  }
}
