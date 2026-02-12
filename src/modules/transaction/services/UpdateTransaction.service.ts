import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { CategoryRepository } from '@modules/category/repositories/contracts/CategoryRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { UpdateTransactionDTO } from '../dto/UpdateTransactionDTO';
import { Transaction } from '../entities/Transaction';
import { InvalidAmountError } from '../errors/InvalidAmountError';
import { TransactionNotFoundError } from '../errors/TransactionNotFoundError';
import { TransactionRepository } from '../repositories/contracts/TransactionRepository';

type Request = UpdateTransactionDTO & TokenPayloadBase;
type Errors = UnauthorizedError | InvalidAmountError | TransactionNotFoundError;
type Response = {
  transaction: Transaction;
};

@Injectable()
export class UpdateTransactionService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute({
    workspaceId,
    transactionId,
    accountId,
    categoryId,
    description,
    amount,
    date,
    type,
    status,
  }: Request): Promise<Either<Errors, Response>> {
    if (amount <= 0) {
      return left(new InvalidAmountError());
    }

    const oldTransaction =
      await this.transactionRepository.findUniqueById(transactionId);

    if (!oldTransaction) {
      return left(new TransactionNotFoundError());
    }

    if (oldTransaction.workspaceId !== workspaceId) {
      return left(new UnauthorizedError());
    }

    const account = await this.accountRepository.findById(accountId);
    if (!account || account.workspaceId !== workspaceId) {
      return left(new UnauthorizedError());
    }

    if (categoryId) {
      const category = await this.categoryRepository.findById(categoryId);
      if (
        !category ||
        (category.workspaceId !== workspaceId && !category.isSystemCategory)
      ) {
        return left(new UnauthorizedError());
      }
    }

    const newTransaction = new Transaction(
      {
        workspaceId,
        accountId,
        categoryId,
        description,
        amount: BigInt(amount),
        date,
        type,
        status,
        recurringId: oldTransaction.recurringId,
        createdAt: oldTransaction.createdAt,
        updatedAt: new Date(),
      },
      transactionId,
    );

    await this.transactionRepository.updateWithBalanceUpdate(
      oldTransaction,
      newTransaction,
    );

    await this.transactionRepository.updateWithBalanceUpdate(
      oldTransaction,
      newTransaction,
    );

    return right({
      transaction: newTransaction,
    });
  }
}
