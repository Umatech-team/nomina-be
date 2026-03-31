import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { CategoryRepository } from '@modules/category/repositories/contracts/CategoryRepository';
import { Transaction } from '@modules/transaction/entities/Transaction';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UpdateTransactionRequest } from './update-transaction.dto';

type Request = UpdateTransactionRequest & {
  transactionId: string;
} & TokenPayloadBase;
type Errors = HttpException;
type Response = Transaction;

@Injectable()
export class UpdateTransactionHandler
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
    title,
    description,
    amount,
    date,
    type,
    status,
  }: Request): Promise<Either<Errors, Response>> {
    const currentTransaction =
      await this.transactionRepository.findUniqueById(transactionId);

    if (!currentTransaction) {
      return left(new HttpException('Transaction not found', 404));
    }

    if (currentTransaction.workspaceId !== workspaceId) {
      return left(new HttpException('Unauthorized', 403));
    }

    const account = await this.accountRepository.findById(accountId);
    if (!account || account.workspaceId !== workspaceId) {
      return left(new HttpException('Unauthorized', 403));
    }

    if (categoryId) {
      const category = await this.categoryRepository.findById(categoryId);
      if (
        !category ||
        (category.workspaceId !== workspaceId && !category.isSystemCategory)
      ) {
        return left(new HttpException('Unauthorized', 403));
      }
    }

    const newTransactionOrError = Transaction.create(
      {
        workspaceId,
        accountId,
        categoryId,
        title,
        description: description ?? null,
        amount: BigInt(amount),
        date,
        type,
        status,
        recurringId: currentTransaction.recurringId,
        createdAt: currentTransaction.createdAt,
        updatedAt: new Date(),
      },
      transactionId,
    );

    if (newTransactionOrError.isLeft()) {
      return left(new HttpException(newTransactionOrError.value.message, 400));
    }

    const newTransaction = newTransactionOrError.value;
    const newBalance =
      account.balance - currentTransaction.amount + newTransaction.amount;

    await this.transactionRepository.updateWithBalanceUpdate(
      newTransaction,
      Number(newBalance),
    );

    return right(newTransaction);
  }
}
