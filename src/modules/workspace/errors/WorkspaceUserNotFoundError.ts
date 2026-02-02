import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class WorkspaceUserNotFoundError extends Error implements ServiceError {
  statusCode: number = statusCode.NOT_FOUND;

  constructor() {
    super('Usuário do workspace não encontrado');
  }
}
