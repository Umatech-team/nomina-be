import { ForbiddenDomainError } from '@shared/core/errors/DomainError';

export class UnauthorizedError extends ForbiddenDomainError {
  constructor(reason?: string) {
    super(
      `Você não possui permissão para executar essa ação: ${reason || 'Não autorizado'}`,
    );
  }
}
