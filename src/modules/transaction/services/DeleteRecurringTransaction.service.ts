import { Injectable } from '@nestjs/common';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { RecurringTransactionNotFoundError } from '../errors/RecurringTransactionNotFoundError';
import { RecurringTransactionRepository } from '../repositories/contracts/RecurringTransactionRepository';

interface DeleteRecurringTransactionRequest {
  recurringTransactionId: string;
  workspaceId: string;
  sub: string;
}

type Errors = UnauthorizedError | RecurringTransactionNotFoundError;

type Response = {
  message: string;
};

@Injectable()
export class DeleteRecurringTransactionService
  implements Service<DeleteRecurringTransactionRequest, Errors, Response>
{
  constructor(
    private readonly recurringRepository: RecurringTransactionRepository,
  ) {}

  async execute({
    recurringTransactionId,
    workspaceId,
  }: DeleteRecurringTransactionRequest): Promise<Either<Errors, Response>> {
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

    // Delete (transactions already generated remain as history)
    await this.recurringRepository.delete(recurringTransactionId);

    return right({ message: 'Transação recorrente deletada com sucesso' });
  }
}
