import { Transaction } from '@modules/transaction/entities/Transaction';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { DayJsDateProvider } from '@providers/date/implementations/Dayjs';
import { Service } from '@shared/core/contracts/Service';
import { Either, right } from '@shared/core/errors/Either';
import { ListTransactionsRequest } from './list-transaction.dto';

type Request = ListTransactionsRequest & TokenPayloadBase;

type Response = {
  transactions: Transaction[];
  total: number;
};

@Injectable()
export class ListTransactionsService implements Service<
  Request,
  Error,
  Response
> {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly dateProvider: DayJsDateProvider,
  ) {}

  async execute(request: Request): Promise<Either<Error, Response>> {
    const workspaceTimezone = 'America/Sao_Paulo'; // TODO: o ideal é vir do payload do JWT ou Workspace

    const start = request.startDate
      ? this.dateProvider.startOfDay(request.startDate, workspaceTimezone)
      : undefined;

    const end = request.endDate
      ? this.dateProvider.endOfDay(request.endDate, workspaceTimezone)
      : undefined;

    const { transactions, total } =
      await this.transactionRepository.listTransactionsByWorkspaceId({
        workspaceId: request.workspaceId,
        page: request.page,
        pageSize: request.pageSize,
        startDate: start,
        endDate: end,
        type: request.type,
        categoryId: request.categoryId,
        accountId: request.accountId,
        title: request.title,
        status: request.status,
      });

    return right({ transactions, total });
  }
}
