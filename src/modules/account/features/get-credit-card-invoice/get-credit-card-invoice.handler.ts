import { AccountType } from '@constants/enums';
import { Account } from '@modules/account/entities/Account';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { Transaction } from '@modules/transaction/entities/Transaction';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { GetCreditCardInvoiceRequest } from './get-credit-card-invoice.dto';

type Request = GetCreditCardInvoiceRequest &
  TokenPayloadBase & { accountId: string };
type Errors = HttpException;
type Response = {
  account: Account;
  transactions: Transaction[];
  totalAmount: number;
  availableLimit: number | null;
  dueDate: Date;
  periodStart: Date;
  periodEnd: Date;
};

@Injectable()
export class GetCreditCardInvoiceHandler implements Service<
  Request,
  Errors,
  Response
> {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(props: Request): Promise<Either<Errors, Response>> {
    const account = await this.accountRepository.findById(props.accountId);

    if (!account) {
      return left(new HttpException('Account not found', statusCode.NOT_FOUND));
    }

    if (account.workspaceId !== props.workspaceId) {
      return left(
        new HttpException(
          'You have no permission to access this account',
          statusCode.FORBIDDEN,
        ),
      );
    }

    if (account.type !== AccountType.CREDIT_CARD) {
      return left(
        new HttpException(
          'Account is not a credit card',
          statusCode.BAD_REQUEST,
        ),
      );
    }

    const now = new Date();
    const month = props.month ?? now.getMonth() + 1;
    const year = props.year ?? now.getFullYear();

    const closingDay = account.closingDay!;
    const dueDay = account.dueDay!;

    const periodEnd = new Date(year, month - 1, closingDay, 23, 59, 59, 999);
    const periodStart = new Date(year, month - 2, closingDay + 1, 0, 0, 0, 0);

    const dueDate = new Date(year, month, dueDay);

    const transactions =
      await this.transactionRepository.findByAccountAndDateRange(
        props.accountId,
        props.workspaceId,
        periodStart,
        periodEnd,
      );

    const totalAmount = transactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );

    const availableLimit =
      account.creditLimit === null
        ? null
        : Number(account.creditLimit) - totalAmount;

    return right({
      account,
      transactions,
      totalAmount,
      availableLimit,
      dueDate,
      periodStart,
      periodEnd,
    });
  }
}
