import { AccountType, TransactionStatus } from '@constants/enums';
import {
  AccountNotFoundError,
  AccountTypeError,
} from '@modules/account/errors';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { Transaction } from '@modules/transaction/entities/Transaction';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { PayCreditCardInvoiceRequest } from './pay-credit-card-invoice.dto';

type Request = PayCreditCardInvoiceRequest &
  TokenPayloadBase & { creditCardAccountId: string };

@Injectable()
export class PayCreditCardInvoiceService implements Service<
  Request,
  Error,
  Transaction
> {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(props: Request): Promise<Either<Error, Transaction>> {
    const creditCardAccount = await this.accountRepository.findById(
      props.creditCardAccountId,
    );

    if (!creditCardAccount) {
      return left(new AccountNotFoundError('Cartão de crédito não encontrado'));
    }

    if (creditCardAccount.workspaceId !== props.workspaceId) {
      return left(new UnauthorizedError());
    }

    if (creditCardAccount.type !== AccountType.CREDIT_CARD) {
      return left(new UnauthorizedError());
    }

    const sourceAccount = await this.accountRepository.findById(
      props.sourceAccountId,
    );

    if (!sourceAccount) {
      return left(new AccountNotFoundError('Conta de origem não encontrada'));
    }

    if (sourceAccount.workspaceId !== props.workspaceId) {
      return left(
        new UnauthorizedError(
          'Conta de origem não pertence ao workspace do usuário',
        ),
      );
    }

    if (sourceAccount.type === AccountType.CREDIT_CARD) {
      return left(
        new AccountTypeError(
          'Conta de origem não pode ser um cartão de crédito',
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

    const amountBigInt = BigInt(props.amount);

    const transaction = Transaction.create({
      amount: amountBigInt,
      description: `Pagamento da fatura do cartão de crédito ${creditCardAccount.name}`,
      sourceAccountId: props.sourceAccountId,
      destinationAccountId: props.creditCardAccountId,
      status: TransactionStatus.COMPLETED,
      workspaceId: props.workspaceId,
      createdBy: props.sub,
    });

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
