import {
  ConflictException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  BusinessRuleDomainError,
  ConflictDomainError,
  NotFoundDomainError,
} from '@shared/core/errors/DomainError';

export class ErrorPresenter {
  static toHTTP(error: Error): never {
    if (error instanceof NotFoundDomainError) {
      throw new NotFoundException(error.message);
    }

    if (error instanceof ConflictDomainError) {
      throw new ConflictException(error.message);
    }

    if (error instanceof BusinessRuleDomainError) {
      throw new UnprocessableEntityException(error.message);
    }

    if (error instanceof HttpException) {
      throw error;
    }

    console.error('Erro de Servidor/Domínio não tratado:', error);
    throw new InternalServerErrorException('Erro interno do servidor');
  }
}
