import {
  BusinessRuleDomainError,
  ConflictDomainError,
  NotFoundDomainError,
} from '@shared/core/errors/DomainError';

export class UserNotFoundError extends NotFoundDomainError {
  constructor() {
    super('Usuário não encontrado ou não existe');
  }
}

export class WrongCredentialsError extends BusinessRuleDomainError {
  constructor() {
    super('Email ou senha inválidos');
  }
}

export class UserAlreadyExistsError extends ConflictDomainError {
  constructor() {
    super('Usuário já existe');
  }
}
