import { Injectable } from '@nestjs/common';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { RecurringTransaction } from '../entities/RecurringTransaction';
import { RecurringTransactionNotFoundError } from '../errors/RecurringTransactionNotFoundError';
import { RecurringTransactionRepository } from '../repositories/contracts/RecurringTransactionRepository';

interface FindRecurringTransactionRequest {
  recurringTransactionId: string;
  workspaceId: string;
  sub: string;
}

type Errors = UnauthorizedError | RecurringTransactionNotFoundError;

type Response = {
  recurringTransaction: RecurringTransaction;
};

@Injectable()
export class FindRecurringTransactionService
  implements Service<FindRecurringTransactionRequest, Errors, Response>
{
  constructor(
    private readonly recurringRepository: RecurringTransactionRepository,
  ) {}

  async execute({
    recurringTransactionId,
    workspaceId,
  }: FindRecurringTransactionRequest): Promise<Either<Errors, Response>> {
    // Find recurring transaction
    const recurring = await this.recurringRepository.findById(
      recurringTransactionId,
    );

    if (!recurring) {
      return left(new RecurringTransactionNotFoundError());
    }

    // Validate ownership
    if (recurring.workspaceId !== workspaceId) {
      return left(new UnauthorizedError());
    }

    return right({ recurringTransaction: recurring });
  }
}
