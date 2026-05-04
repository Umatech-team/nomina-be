import {
  ConflictException,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  BusinessRuleDomainError,
  ConflictDomainError,
  NotFoundDomainError,
} from '@shared/core/errors/DomainError';

export class ErrorPresenter {
  private static readonly logger = new Logger(ErrorPresenter.name);

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

    ErrorPresenter.logger.error('Erro de Servidor/Domínio não tratado:', error);
    throw new InternalServerErrorException('Erro interno do servidor');
  }
}
