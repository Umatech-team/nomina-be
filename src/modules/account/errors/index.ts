import {
  BusinessRuleDomainError,
  ConflictDomainError,
  NotFoundDomainError,
} from '@shared/core/errors/DomainError';

export class AccountNotFoundError extends NotFoundDomainError {
  constructor(reason?: string) {
    super(`Conta não encontrada: ${reason || 'Não existe.'}`);
  }
}

export class AccountTypeError extends BusinessRuleDomainError {
  constructor(reason?: string) {
    super(
      `Tipo de conta inválido: ${reason || 'Tipo não permitido para essa operação.'}`,
    );
  }
}

export class ConflictAccountError extends ConflictDomainError {
  constructor(reason: string) {
    super(`Conflito de conta: ${reason}`);
  }
}

export class CreditLimitExceededError extends BusinessRuleDomainError {
  constructor(available: bigint, requested: bigint) {
    super(
      `Limite insuficiente. Disponível: ${available}, Requisitado: ${requested}`,
    );
  }
}

export class InvalidAccountError extends BusinessRuleDomainError {
  constructor(reason: string) {
    super(`Conta inválida: ${reason}`);
  }
}

export class ValidationAccountError extends BusinessRuleDomainError {
  constructor(reason: string) {
    super(`Erro de validação na conta: ${reason}`);
  }
}

export class InsufficientBalanceError extends BusinessRuleDomainError {
  constructor(reason = 'Saldo insuficiente para essa operação.') {
    super(reason);
  }
}

export class PaymentExceedsInvoiceBalanceError extends BusinessRuleDomainError {
  constructor() {
    super('O pagamento não pode exceder o valor da fatura atual.');
  }
}
