import { UserRepository } from '@modules/user/repositories/contracts/UserRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { ListTransactionsDTO } from '../dto/ListTransactionsDTO';
import { Transaction } from '../entities/Transaction';
import { TransactionNotFoundError } from '../errors/TransactionNotFoundError';
import { TransactionRepository } from '../repositories/contracts/TransactionRepository';
import { GenerateRecurringTransactionsService } from './GenerateRecurringTransactions.service';

type Request = ListTransactionsDTO & TokenPayloadBase;

type Errors = TransactionNotFoundError | UnauthorizedError;

type Response = {
  transaction: Transaction[];
};

@Injectable()
export class ListTransactionByIdService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly userRepository: UserRepository,
    private readonly generateRecurringService: GenerateRecurringTransactionsService,
  ) {}

  async execute({
    sub,
    workspaceId,
    startDate,
    endDate,
    page,
    pageSize,
    type,
    categoryId,
    accountId,
    description,
    status,
  }: Request): Promise<Either<Errors, Response>> {
    const user = await this.userRepository.findUniqueById(sub);

    if (!user) {
      return left(new TransactionNotFoundError());
    }

    await this.generateRecurringService.execute({ workspaceId });

    startDate = startDate
      ? (() => {
          const d = new Date(startDate);
          d.setHours(0, 0, 0, 0);
          return d;
        })()
      : undefined;
    endDate = endDate
      ? (() => {
          const d = new Date(endDate);
          d.setHours(23, 59, 59, 999);
          return d;
        })()
      : undefined;

    const transaction =
      await this.transactionRepository.listTransactionsByWorkspaceId(
        workspaceId,
        page,
        pageSize,
        startDate,
        endDate,
        type,
        categoryId,
        accountId,
        description,
        status,
      );

    if (!transaction) {
      return left(new TransactionNotFoundError());
    }

    return right({
      transaction,
    });
  }
}
