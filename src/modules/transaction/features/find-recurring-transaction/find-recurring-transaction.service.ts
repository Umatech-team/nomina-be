import { RecurringTransaction } from '@modules/transaction/entities/RecurringTransaction';
import { RecurringTransactionNotFoundError } from '@modules/transaction/errors';
import { RecurringTransactionRepository } from '@modules/transaction/repositories/contracts/RecurringTransactionRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { FindRecurringTransactionRequest } from './find-recurring-transaction.dto';

type Request = FindRecurringTransactionRequest &
  Pick<TokenPayloadBase, 'workspaceId'>;

@Injectable()
export class FindRecurringTransactionService implements Service<
  Request,
  Error,
  RecurringTransaction
> {
  constructor(
    private readonly recurringRepository: RecurringTransactionRepository,
  ) {}

  async execute({
    recurringTransactionId,
    workspaceId,
  }: Request): Promise<Either<Error, RecurringTransaction>> {
    const recurring = await this.recurringRepository.findById(
      recurringTransactionId,
    );

    if (!recurring) {
      return left(new RecurringTransactionNotFoundError());
    }

    if (recurring.workspaceId !== workspaceId) {
      return left(
        new UnauthorizedError(
          'Transação recorrente não pertence ao workspace.',
        ),
      );
    }

    return right(recurring);
  }
}
