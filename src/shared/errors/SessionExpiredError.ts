import { UnauthorizedDomainError } from '@shared/core/errors/DomainError';

export class SessionExpiredError extends UnauthorizedDomainError {
  constructor() {
    super('Sessão expirada. Por favor, faça login novamente para continuar.');
  }
}
