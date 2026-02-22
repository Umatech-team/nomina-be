import { Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, right } from '@shared/core/errors/Either';
import { ListRecurringTransactionsDTO } from '../dto/ListRecurringTransactionsDTO';
import { RecurringTransaction } from '../entities/RecurringTransaction';
import { RecurringTransactionRepository } from '../repositories/contracts/RecurringTransactionRepository';

type Request = ListRecurringTransactionsDTO &
  TokenPayloadBase & { activeOnly?: boolean };

type Errors = never;

type Response = {
  recurringTransactions: RecurringTransaction[];
};

@Injectable()
export class ListRecurringTransactionsService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly recurringRepository: RecurringTransactionRepository,
  ) {}

  async execute({
    workspaceId,
    page,
    pageSize,
    activeOnly,
  }: Request): Promise<Either<Errors, Response>> {
    console.log({ page, pageSize, activeOnly });
    const recurrings = activeOnly
      ? await this.recurringRepository.findActiveByWorkspaceId(
          workspaceId,
          page,
          pageSize,
        )
      : await this.recurringRepository.findByWorkspaceId(
          workspaceId,
          page,
          pageSize,
        );

    return right({ recurringTransactions: recurrings });
  }
}
