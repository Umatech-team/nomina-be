import { ServiceError } from '@shared/core/errors/ServiceError';
import { statusCode } from '@shared/core/types/statusCode';

export class ConflictWorkspaceUserError extends Error implements ServiceError {
  statusCode: number = statusCode.CONFLICT;

  constructor() {
    super('Usuário já está no workspace');
  }
}
