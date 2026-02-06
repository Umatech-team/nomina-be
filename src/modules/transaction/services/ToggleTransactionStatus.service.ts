import { Injectable } from '@nestjs/common';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { Transaction } from '../entities/Transaction';
import { TransactionNotFoundError } from '../errors/TransactionNotFoundError';
import { TransactionRepository } from '../repositories/contracts/TransactionRepository';

interface Request {
  transactionId: string;
  workspaceId: string;
  sub: string;
}

type Errors = TransactionNotFoundError | UnauthorizedError;

interface Response {
  transaction: Transaction;
}

@Injectable()
export class ToggleTransactionStatusService
  implements Service<Request, Errors, Response>
{
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute({
    transactionId,
    workspaceId,
  }: Request): Promise<Either<Errors, Response>> {
    const transaction =
      await this.transactionRepository.findUniqueById(transactionId);

    if (!transaction) {
      return left(new TransactionNotFoundError());
    }

    if (transaction.workspaceId !== workspaceId) {
      return left(new UnauthorizedError());
    }

    const updatedTransaction =
      await this.transactionRepository.toggleStatusWithBalanceUpdate(
        transactionId,
      );

    return right({
      transaction: updatedTransaction,
    });
  }
}
