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
export class DeleteTransactionHandler
  implements Service<Request, Errors, Response>
{
  constructor(private readonly transactionRepository: TransactionRepository) {}

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

    const account = await this.transactionRepository.findUniqueById(
      transaction.accountId,
    );

    if (!account) {
      return left(new HttpException('Conta associada não encontrada', 404));
    }

    const newBalance = account.amount - transaction.amount;

    await this.transactionRepository.deleteWithBalanceReversion(
      transaction,
      Number(newBalance),
    );

    return right(transaction);
  }
}
