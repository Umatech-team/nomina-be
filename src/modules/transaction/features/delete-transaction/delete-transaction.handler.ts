import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { Transaction } from '@modules/transaction/entities/Transaction';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { FindTransactionRequest } from '../find-transaction/find-transaction.dto';

type Request = FindTransactionRequest & TokenPayloadBase;
type Errors = HttpException;
type Response = Transaction;

@Injectable()
export class DeleteTransactionHandler implements Service<
  Request,
  Errors,
  Response
> {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute({
    workspaceId,
    transactionId,
  }: Request): Promise<Either<Errors, Response>> {
    const transaction =
      await this.transactionRepository.findUniqueById(transactionId);

    if (!transaction) {
      return left(new HttpException('Transação não encontrada', 404));
    }

    if (transaction.workspaceId !== workspaceId) {
      return left(new HttpException('Não autorizado', 403));
    }

    const account = await this.accountRepository.findById(
      transaction.accountId,
    );

    if (!account) {
      return left(new HttpException('Conta associada não encontrada', 404));
    }

    if (transaction.type === 'TRANSFER' && transaction.destinationAccountId) {
      const destinationAccount = await this.accountRepository.findById(
        transaction.destinationAccountId,
      );
      const sourceNewBalance = Number(account.balance + transaction.amount);
      const destNewBalance = destinationAccount
        ? Number(destinationAccount.balance - transaction.amount)
        : undefined;

      await this.transactionRepository.deleteWithBalanceReversion(
        transaction,
        sourceNewBalance,
        destNewBalance,
      );
    } else {
      const newBalance =
        transaction.type === 'EXPENSE'
          ? account.balance + transaction.amount
          : account.balance - transaction.amount;

      await this.transactionRepository.deleteWithBalanceReversion(
        transaction,
        Number(newBalance),
      );
    }

    return right(transaction);
  }
}
