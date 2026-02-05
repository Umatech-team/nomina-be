import { Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { FindTransactionDTO } from '../dto/FindTransactionDTO';
import { Transaction } from '../entities/Transaction';
import { TransactionNotFoundError } from '../errors/TransactionNotFoundError';
import { TransactionRepository } from '../repositories/contracts/TransactionRepository';

type Request = FindTransactionDTO & TokenPayloadBase;
type Errors = UnauthorizedError | TransactionNotFoundError;
type Response = {
  transaction: Transaction;
};

@Injectable()
export class DeleteTransactionService
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
      return left(new TransactionNotFoundError());
    }

    if (transaction.workspaceId !== workspaceId) {
      return left(new UnauthorizedError());
    }

    await this.transactionRepository.deleteWithBalanceReversion(transaction);

    return right({
      transaction,
    });
  }
}
