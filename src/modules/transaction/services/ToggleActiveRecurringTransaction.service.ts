import { Injectable } from '@nestjs/common';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { RecurringTransaction } from '../entities/RecurringTransaction';
import { RecurringTransactionNotFoundError } from '../errors/RecurringTransactionNotFoundError';
import { RecurringTransactionRepository } from '../repositories/contracts/RecurringTransactionRepository';

interface ToggleActiveRecurringTransactionRequest {
  recurringTransactionId: string;
  workspaceId: string;
  sub: string;
}

type Errors = UnauthorizedError | RecurringTransactionNotFoundError;

type Response = {
  recurringTransaction: RecurringTransaction;
};

@Injectable()
export class ToggleActiveRecurringTransactionService
  implements Service<ToggleActiveRecurringTransactionRequest, Errors, Response>
{
  constructor(
    private readonly recurringRepository: RecurringTransactionRepository,
  ) {}

  async execute({
    recurringTransactionId,
    workspaceId,
  }: ToggleActiveRecurringTransactionRequest): Promise<
    Either<Errors, Response>
  > {
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

    // Toggle active status
    recurring.active = !recurring.active;

    // Persist
    const updated = await this.recurringRepository.update(recurring);

    return right({ recurringTransaction: updated });
  }
}
