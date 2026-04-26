import { CreditCard } from '@modules/account/entities/CreditCardAccount';
import {
  AccountNotFoundError,
  AccountTypeError,
} from '@modules/account/errors';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { Transaction } from '@modules/transaction/entities/Transaction';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { DayJsDateProvider } from '@providers/date/implementations/Dayjs';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { GetCreditCardInvoiceRequest } from './get-credit-card-invoice.dto';

type Request = GetCreditCardInvoiceRequest &
  TokenPayloadBase & { accountId: string };
type Response = {
  account: CreditCard;
  transactions: Transaction[];
  totalAmount: number;
  availableLimit: number | null;
  dueDate: Date;
  periodStart: Date;
  periodEnd: Date;
};

@Injectable()
export class GetCreditCardInvoiceService implements Service<
  Request,
  Error,
  Response
> {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly dateProvider: DayJsDateProvider,
  ) {}

  async execute(props: Request): Promise<Either<Error, Response>> {
    const account = await this.accountRepository.findById(props.accountId);

    if (!account) return left(new AccountNotFoundError());

    if (account.workspaceId !== props.workspaceId)
      return left(new UnauthorizedError());

    if (!(account instanceof CreditCard)) return left(new AccountTypeError());

    const institutionTimezone = account.timezone ?? 'America/Sao_Paulo';

    const referenceDate =
      props.month && props.year
        ? new Date(Date.UTC(props.year, props.month - 1, 1))
        : this.dateProvider.now();

    const { periodStart, periodEnd, dueDate } =
      this.dateProvider.calculateInvoiceCycle({
        referenceDate,
        closingDay: account.closingDay,
        dueDay: account.dueDay,
        timezone: institutionTimezone,
      });

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
