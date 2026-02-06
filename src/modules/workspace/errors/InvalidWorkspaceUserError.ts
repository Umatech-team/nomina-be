import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class InvalidWorkspaceUserError extends Error implements ServiceError {
  statusCode: number = statusCode.BAD_REQUEST;

  constructor(reason: string) {
    super(`Não foi possível criar o espaço de usuário: ${reason}`);
    this.name = 'InvalidWorkspaceUserError';
  }
}
