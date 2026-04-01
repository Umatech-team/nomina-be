import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { Transaction } from '@modules/transaction/entities/Transaction';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { ToggleTransactionStatusRequest } from './toggle-transaction-status.dto';

type Request = ToggleTransactionStatusRequest &
  Pick<TokenPayloadBase, 'workspaceId'>;
type Errors = HttpException;

type Response = Transaction;

@Injectable()
export class ToggleTransactionStatusHandler
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute({
    transactionId,
    workspaceId,
  }: Request): Promise<Either<Errors, Response>> {
    const transaction =
      await this.transactionRepository.findUniqueById(transactionId);

    if (!transaction) {
      return left(new HttpException('Transaction not found', 404));
    }

    if (transaction.workspaceId !== workspaceId) {
      return left(new HttpException('Unauthorized', 403));
    }

    const account = await this.accountRepository.findById(
      transaction.accountId,
    );

    if (!account) {
      return left(new HttpException('Account not found', 404));
    }

    if (transaction.type === 'TRANSFER' && transaction.destinationAccountId) {
      const destinationAccount = await this.accountRepository.findById(
        transaction.destinationAccountId,
      );

      let sourceNewBalance: bigint;
      let destNewBalance: number | undefined;

      if (transaction.status === 'PENDING') {
        // PENDING → COMPLETED: apply to both
        sourceNewBalance = account.balance - BigInt(transaction.amount);
        if (destinationAccount) {
          destNewBalance = Number(
            destinationAccount.balance + BigInt(transaction.amount),
          );
        }
      } else {
        // COMPLETED → PENDING: revert both
        sourceNewBalance = account.balance + BigInt(transaction.amount);
        if (destinationAccount) {
          destNewBalance = Number(
            destinationAccount.balance - BigInt(transaction.amount),
          );
        }
      }

      const updatedTransaction =
        await this.transactionRepository.toggleStatusWithBalanceUpdate(
          transactionId,
          Number(sourceNewBalance),
          transaction.destinationAccountId,
          destNewBalance,
        );

      return right(updatedTransaction);
    }

    const newBalance =
      transaction.status === 'PENDING'
        ? account.balance + BigInt(transaction.amount)
        : account.balance - BigInt(transaction.amount);

    const updatedTransaction =
      await this.transactionRepository.toggleStatusWithBalanceUpdate(
        transactionId,
        Number(newBalance),
      );

    return right(updatedTransaction);
  }
}
