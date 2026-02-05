import { TransactionStatus } from '@constants/enums';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { CategoryRepository } from '@modules/category/repositories/contracts/CategoryRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { CreateTransactionDTO } from '../dto/CreateTransactionDTO';
import { Transaction } from '../entities/Transaction';
import { InvalidAmountError } from '../errors/InvalidAmountError';
import { TransactionRepository } from '../repositories/contracts/TransactionRepository';

type Request = CreateTransactionDTO & TokenPayloadBase;
type Errors = UnauthorizedError | InvalidAmountError;
type Response = {
  transaction: Transaction;
};

@Injectable()
export class CreateTransactionService
  implements Service<Request, Errors, Response>
{
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute({
    workspaceId,
    accountId,
    categoryId,
    description,
    amount,
    date,
    type,
    status = TransactionStatus.COMPLETED,
  }: Request): Promise<Either<Errors, Response>> {
    if (amount <= 0) {
      return left(new InvalidAmountError());
    }

    const account = await this.accountRepository.findById(accountId);
    if (!account || account.workspaceId !== workspaceId) {
      return left(new UnauthorizedError());
    }

    if (categoryId) {
      const category = await this.categoryRepository.findById(categoryId);

      const isGlobalCategory = !category?.workspaceId;
      const belongsToWorkspace = category?.workspaceId === workspaceId;

      if (!category || (!isGlobalCategory && !belongsToWorkspace)) {
        return left(new UnauthorizedError());
      }
    }

    const transaction = new Transaction({
      workspaceId,
      accountId,
      categoryId,
      description,
      amount: BigInt(amount),
      date,
      type,
      status,
      recurringId: null,
      createdAt: new Date(),
      updatedAt: null,
    });

    await this.transactionRepository.createWithBalanceUpdate(transaction);

    return right({
      transaction,
    });
  }
}
