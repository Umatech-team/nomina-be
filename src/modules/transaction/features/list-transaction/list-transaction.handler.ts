import { Transaction } from '@modules/transaction/entities/Transaction';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { GenerateRecurringTransactionsService } from '@modules/transaction/services/GenerateRecurringTransactions.service';
import { UserRepository } from '@modules/user/repositories/contracts/user.repository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { ListTransactionsRequest } from './list-transaction.dto';

type Request = ListTransactionsRequest & TokenPayloadBase;

type Errors = HttpException;

type Response = Transaction[];

@Injectable()
export class ListTransactionByIdHandler
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
      return left(new HttpException('User not found', 404));
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
      return left(new HttpException('Transaction not found', 404));
    }

    return right(transaction);
  }
}
