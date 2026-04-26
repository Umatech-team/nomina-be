import { TransactionStatus } from '@constants/enums';
import { CreditCard } from '@modules/account/entities/CreditCardAccount';
import { AnyAccount } from '@modules/account/entities/types';
import { AccountNotFoundError } from '@modules/account/errors';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { Transaction } from '@modules/transaction/entities/Transaction';
import { TransactionNotFoundError } from '@modules/transaction/errors';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { ToggleTransactionStatusRequest } from './toggle-transaction-status.dto';

type Request = ToggleTransactionStatusRequest &
  Pick<TokenPayloadBase, 'workspaceId'>;

@Injectable()
export class ToggleTransactionStatusService implements Service<
  Request,
  Error,
  Transaction
> {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute(request: Request): Promise<Either<Error, Transaction>> {
    const transaction = await this.transactionRepository.findUniqueById(
      request.transactionId,
    );
    if (!transaction) return left(new TransactionNotFoundError());
    if (transaction.workspaceId !== request.workspaceId)
      return left(new UnauthorizedError());

    const account = await this.accountRepository.findById(
      transaction.accountId,
    );
    if (!account)
      return left(new AccountNotFoundError('Conta origem não encontrada.'));

    let destinationAccount: AnyAccount | null = null;
    if (transaction.type === 'TRANSFER' && transaction.destinationAccountId) {
      destinationAccount = await this.accountRepository.findById(
        transaction.destinationAccountId,
      );
      if (!destinationAccount)
        return left(new AccountNotFoundError('Conta destino não encontrada.'));
    }

    const isCompleting = transaction.status === TransactionStatus.PENDING;

    if (isCompleting) {
      const statusResult = transaction.complete();
      if (statusResult.isLeft()) return left(statusResult.value);

      const applyResult = this.applyMutations(
        transaction,
        account,
        destinationAccount,
      );
      if (applyResult.isLeft()) return left(applyResult.value);
    } else {
      const statusResult = transaction.markAsPending();
      if (statusResult.isLeft()) return left(statusResult.value);

      const revertResult = this.revertMutations(
        transaction,
        account,
        destinationAccount,
      );
      if (revertResult.isLeft()) return left(revertResult.value);
    }

    await this.transactionRepository.updateWithBalanceUpdate(
      transaction,
      Number(account.balance),
      destinationAccount ? Number(destinationAccount.balance) : undefined,
    );

    return right(transaction);
  }

  private applyMutations(
    t: Transaction,
    acc: AnyAccount,
    dest: AnyAccount | null,
  ): Either<Error, void> {
    if (t.type === 'EXPENSE')
      return acc instanceof CreditCard
        ? acc.registerCharge(t.amount)
        : acc.debit(t.amount);
    if (t.type === 'INCOME')
      return acc instanceof CreditCard
        ? acc.payInvoice(t.amount)
        : acc.credit(t.amount);

    if (t.type === 'TRANSFER' && dest) {
      const debitResult =
        acc instanceof CreditCard
          ? acc.registerCharge(t.amount)
          : acc.debit(t.amount);
      if (debitResult.isLeft()) return debitResult;
      return dest instanceof CreditCard
        ? dest.payInvoice(t.amount)
        : dest.credit(t.amount);
    }
    return right(undefined);
  }

  private revertMutations(
    t: Transaction,
    acc: AnyAccount,
    dest: AnyAccount | null,
  ): Either<Error, void> {
    if (t.type === 'EXPENSE')
      return acc instanceof CreditCard
        ? acc.payInvoice(t.amount)
        : acc.credit(t.amount);
    if (t.type === 'INCOME')
      return acc instanceof CreditCard
        ? acc.registerCharge(t.amount)
        : acc.debit(t.amount);

    if (t.type === 'TRANSFER' && dest) {
      const creditResult =
        acc instanceof CreditCard
          ? acc.payInvoice(t.amount)
          : acc.credit(t.amount);
      if (creditResult.isLeft()) return creditResult;
      return dest instanceof CreditCard
        ? dest.registerCharge(t.amount)
        : dest.debit(t.amount);
    }
    return right(undefined);
  }
}
