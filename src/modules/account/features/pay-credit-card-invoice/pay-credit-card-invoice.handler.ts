import { AccountType, TransactionStatus } from '@constants/enums';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { Transaction } from '@modules/transaction/entities/Transaction';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { MoneyUtils } from '@utils/MoneyUtils';
import { PayCreditCardInvoiceRequest } from './pay-credit-card-invoice.dto';

type Request = PayCreditCardInvoiceRequest &
  TokenPayloadBase & { creditCardAccountId: string };
type Errors = HttpException;
type Response = Transaction;

@Injectable()
export class PayCreditCardInvoiceHandler implements Service<
  Request,
  Errors,
  Response
> {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(props: Request): Promise<Either<Errors, Response>> {
    const creditCardAccount = await this.accountRepository.findById(
      props.creditCardAccountId,
    );

    if (!creditCardAccount) {
      return left(
        new HttpException(
          'Credit card account not found',
          statusCode.NOT_FOUND,
        ),
      );
    }

    if (creditCardAccount.workspaceId !== props.workspaceId) {
      return left(
        new HttpException(
          'You have no permission to access this account',
          statusCode.FORBIDDEN,
        ),
      );
    }

    if (creditCardAccount.type !== AccountType.CREDIT_CARD) {
      return left(
        new HttpException(
          'Account is not a credit card',
          statusCode.BAD_REQUEST,
        ),
      );
    }

    const sourceAccount = await this.accountRepository.findById(
      props.sourceAccountId,
    );

    if (!sourceAccount) {
      return left(
        new HttpException('Source account not found', statusCode.NOT_FOUND),
      );
    }

    if (sourceAccount.workspaceId !== props.workspaceId) {
      return left(
        new HttpException(
          'Source account does not belong to your workspace',
          statusCode.FORBIDDEN,
        ),
      );
    }

    if (sourceAccount.type === AccountType.CREDIT_CARD) {
      return left(
        new HttpException(
          'Source account cannot be a credit card',
          statusCode.BAD_REQUEST,
        ),
      );
    }

    if (props.sourceAccountId === props.creditCardAccountId) {
      return left(
        new HttpException(
          'Source and destination accounts must be different',
          statusCode.BAD_REQUEST,
        ),
      );
    }

    const amountInCents = MoneyUtils.decimalToCents(props.amount);
    const amountBigInt = BigInt(amountInCents);

    const transaction = new Transaction(
      {
        workspaceId: props.workspaceId,
        accountId: props.sourceAccountId,
        destinationAccountId: props.creditCardAccountId,
        categoryId: props.categoryId ?? null,
        title: `Pagamento fatura ${creditCardAccount.name}`,
        description: props.description ?? null,
        amount: amountBigInt,
        date: new Date(),
        type: 'TRANSFER',
        status: TransactionStatus.COMPLETED,
        recurringId: null,
        createdAt: new Date(),
        updatedAt: null,
      },
      undefined,
    );

    const sourceNewBalance = Number(sourceAccount.balance - amountBigInt);
    const destNewBalance = Number(creditCardAccount.balance + amountBigInt);

    await this.transactionRepository.createWithBalanceUpdate(
      transaction,
      sourceNewBalance,
      destNewBalance,
    );

    return right(transaction);
  }
}
