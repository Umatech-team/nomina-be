import { Injectable } from '@nestjs/common';
import { Service } from '@shared/core/contracts/Service';
import { Either, right } from '@shared/core/errors/Either';
import { RecurringTransaction } from '../entities/RecurringTransaction';
import { RecurringTransactionRepository } from '../repositories/contracts/RecurringTransactionRepository';

interface ListRecurringTransactionsRequest {
  workspaceId: string;
  activeOnly?: boolean;
  sub: string;
}

type Errors = never;

type Response = {
  recurringTransactions: RecurringTransaction[];
};

@Injectable()
export class ListRecurringTransactionsService
  implements Service<ListRecurringTransactionsRequest, Errors, Response>
{
  constructor(
    private readonly recurringRepository: RecurringTransactionRepository,
  ) {}

  async execute({
    workspaceId,
    activeOnly,
  }: ListRecurringTransactionsRequest): Promise<Either<Errors, Response>> {
    const recurrings = activeOnly
      ? await this.recurringRepository.findActiveByWorkspaceId(workspaceId)
      : await this.recurringRepository.findByWorkspaceId(workspaceId);

    return right({ recurringTransactions: recurrings });
  }
}
