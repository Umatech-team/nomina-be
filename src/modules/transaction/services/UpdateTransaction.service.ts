import { TransactionStatus, TransactionType } from '@constants/enums';
import { PrismaService } from '@infra/databases/prisma/prisma.service';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { CategoryRepository } from '@modules/category/repositories/contracts/CategoryRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { UpdateTransactionDTO } from '../dto/UpdateTransactionDTO';
import { Transaction } from '../entities/Transaction';
import { InvalidAmountError } from '../errors/InvalidAmountError';
import { TransactionNotFoundError } from '../errors/TransactionNotFoundError';

type Request = UpdateTransactionDTO & TokenPayloadSchema;
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
    private readonly prisma: PrismaService,
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
    // Validate amount
    if (amount <= 0) {
      return left(new InvalidAmountError());
    }

    // Fetch old transaction to validate ownership and calculate delta
    const oldTransaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!oldTransaction) {
      return left(new TransactionNotFoundError());
    }

    if (oldTransaction.workspaceId !== workspaceId) {
      return left(new UnauthorizedError());
    }

    // Validate account belongs to workspace
    const account = await this.accountRepository.findById(accountId);
    if (!account || account.workspaceId !== workspaceId) {
      return left(new UnauthorizedError());
    }

    // Validate category belongs to workspace if provided
    if (categoryId) {
      const category = await this.categoryRepository.findById(categoryId);
      if (!category || category.workspaceId !== workspaceId) {
        return left(new UnauthorizedError());
      }
    }

    // Calculate balance effects
    const oldEffect = this.calculateBalanceEffect({
      amount: oldTransaction.amount,
      type: oldTransaction.type as TransactionType,
      status: oldTransaction.status as TransactionStatus,
      accountId: oldTransaction.accountId,
    });

    const newEffect = this.calculateBalanceEffect({
      amount: BigInt(amount),
      type,
      status,
      accountId,
    });

    // Update transaction atomically with balance adjustment
    const result = await this.prisma.$transaction(async (tx) => {
      // Update transaction
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          accountId,
          categoryId,
          description,
          amount: BigInt(amount),
          date,
          type,
          status,
        },
      });

      // Apply balance changes to affected accounts
      // If account changed, revert from old and apply to new
      if (oldTransaction.accountId !== accountId) {
        // Revert old account balance
        if (oldEffect !== 0) {
          await tx.account.update({
            where: { id: oldTransaction.accountId },
            data: { balance: { increment: -oldEffect } },
          });
        }

        // Apply new account balance
        if (newEffect !== 0) {
          await tx.account.update({
            where: { id: accountId },
            data: { balance: { increment: newEffect } },
          });
        }
      } else {
        // Same account, apply delta
        const delta = newEffect - oldEffect;
        if (delta !== 0) {
          await tx.account.update({
            where: { id: accountId },
            data: { balance: { increment: delta } },
          });
        }
      }

      return updatedTransaction;
    });

    // Map to entity
    const transaction = new Transaction(
      {
        workspaceId: result.workspaceId,
        accountId: result.accountId,
        categoryId: result.categoryId,
        description: result.description,
        amount: result.amount,
        date: result.date,
        type: result.type as TransactionType,
        status: result.status as TransactionStatus,
        recurringId: result.recurringId,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      },
      result.id,
    );

    return right({
      transaction,
    });
  }

  private calculateBalanceEffect(tx: {
    amount: bigint;
    type: TransactionType;
    status: TransactionStatus;
    accountId: string;
  }): number {
    // Only completed transactions affect balance
    if (tx.status !== TransactionStatus.COMPLETED) return 0;

    const amountNum = Number(tx.amount);
    return tx.type === TransactionType.INCOME ? amountNum : -amountNum;
  }
}
