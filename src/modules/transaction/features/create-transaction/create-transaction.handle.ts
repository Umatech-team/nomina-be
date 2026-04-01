import { TransactionStatus } from '@constants/enums';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { CategoryRepository } from '@modules/category/repositories/contracts/CategoryRepository';
import { Transaction } from '@modules/transaction/entities/Transaction';
import { TransactionRepository } from '@modules/transaction/repositories/contracts/TransactionRepository';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenPayloadBase } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { statusCode } from '@shared/core/types/statusCode';
import { CreateTransactionRequest } from './create-transaction.dto';

type Request = CreateTransactionRequest & TokenPayloadBase;
type Errors = HttpException;
type Response = Transaction;

@Injectable()
export class CreateTransactionHandler implements Service<
  Request,
  Errors,
  Response
> {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute({
    workspaceId,
    accountId,
    categoryId,
    title,
    description,
    amount,
    date,
    type,
    status = TransactionStatus.COMPLETED,
    destinationAccountId,
  }: Request): Promise<Either<Errors, Response>> {
    const account = await this.accountRepository.findById(accountId);
    if (account?.workspaceId !== workspaceId) {
      return left(new HttpException('Unauthorized', 401));
    }

    if (categoryId) {
      const category = await this.categoryRepository.findById(categoryId);

      const isGlobalCategory = !category?.workspaceId;
      const belongsToWorkspace = category?.workspaceId === workspaceId;

      if (!category || (!isGlobalCategory && !belongsToWorkspace)) {
        return left(new HttpException('Unauthorized', 401));
      }
    }

    const transaction = new Transaction({
      workspaceId,
      accountId,
      categoryId,
      destinationAccountId: destinationAccountId ?? null,
      title,
      description: description ?? null,
      amount: BigInt(amount),
      date,
      type,
      status,
      recurringId: null,
      createdAt: new Date(),
      updatedAt: null,
    });

    if (type === 'TRANSFER') {
      if (!destinationAccountId) {
        return left(
          new HttpException(
            'Conta destino é obrigatória para transferências',
            statusCode.BAD_REQUEST,
          ),
        );
      }

      const destinationAccount =
        await this.accountRepository.findById(destinationAccountId);

      if (!destinationAccount) {
        return left(
          new HttpException(
            'Conta destino não encontrada',
            statusCode.NOT_FOUND,
          ),
        );
      }

      if (destinationAccount.workspaceId !== workspaceId) {
        return left(
          new HttpException(
            'Conta destino não pertence ao workspace',
            statusCode.FORBIDDEN,
          ),
        );
      }

      const sourceNewBalance = Number(account.balance - transaction.amount);
      const destNewBalance = Number(
        destinationAccount.balance + transaction.amount,
      );

      await this.transactionRepository.createWithBalanceUpdate(
        transaction,
        sourceNewBalance,
        destNewBalance,
      );
    } else {
      const newBalance =
        account.balance +
        (type === 'INCOME' ? transaction.amount : -transaction.amount);

      await this.transactionRepository.createWithBalanceUpdate(
        transaction,
        Number(newBalance),
      );
    }

    return right(transaction);
  }
}
