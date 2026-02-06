import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class InvalidWorkspaceInviteError extends Error implements ServiceError {
  statusCode: number = statusCode.BAD_REQUEST;

  constructor(reason: string) {
    super(`Não foi possível criar o convite para o espaço: ${reason}`);
    this.name = 'InvalidWorkspaceInviteError';
  }
}
