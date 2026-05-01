import {
  ConflictDomainError,
  NotFoundDomainError,
} from '@shared/core/errors/DomainError';

export class WorkspaceNotFoundError extends NotFoundDomainError {
  constructor() {
    super('Workspace não encontrado');
  }
}

export class WorkspaceUserNotFoundError extends NotFoundDomainError {
  constructor() {
    super('Usuário do workspace não encontrado');
  }
}

export class InviteExpiredError extends NotFoundDomainError {
  constructor() {
    super('Convite expirado');
  }
}

export class ConflictWorkspaceUserError extends ConflictDomainError {
  constructor() {
    super('Usuário já está no workspace');
  }
}

export class ConflictWorkspaceInviteError extends ConflictDomainError {
  constructor() {
    super('Convite já existe para esse usuário e workspace');
  }
}

export class InvalidWorkspaceInviteError extends ConflictDomainError {
  constructor() {
    super('Convite inválido');
  }
}

export class CannotDeleteDefaultWorkspaceError extends ConflictDomainError {
  constructor() {
    super(
      'Não é possível excluir o workspace padrão. Defina outro workspace como padrão antes.',
    );
  }
}
