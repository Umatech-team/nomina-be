import { TransactionStatus, TransactionType } from '@constants/enums';
import { PrismaService } from '@infra/databases/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { Transaction } from '../entities/Transaction';
import { TransactionNotFoundError } from '../errors/TransactionNotFoundError';

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
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    transactionId,
    workspaceId,
  }: Request): Promise<Either<Errors, Response>> {
    // 1. Fetch transaction
    const transactionData = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transactionData) {
      return left(new TransactionNotFoundError());
    }

    // 2. Validate workspace ownership
    if (transactionData.workspaceId !== workspaceId) {
      return left(new UnauthorizedError());
    }

    // 3. Determine new status
    const oldStatus = transactionData.status as TransactionStatus;
    const newStatus =
      oldStatus === TransactionStatus.COMPLETED
        ? TransactionStatus.PENDING
        : TransactionStatus.COMPLETED;

    // 4. Calculate balance delta
    const balanceEffect = this.calculateBalanceEffect(
      transactionData.amount,
      transactionData.type as TransactionType,
    );

    const balanceDelta =
      newStatus === TransactionStatus.COMPLETED
        ? balanceEffect // Add to balance
        : -balanceEffect; // Remove from balance

    // 5. Update atomically
    const updatedTransaction = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id: transactionId },
        data: { status: newStatus },
      });

      await tx.account.update({
        where: { id: transactionData.accountId },
        data: { balance: { increment: balanceDelta } },
      });

      return updated;
    });

    // 6. Map to entity
    const transaction = new Transaction(
      {
        workspaceId: updatedTransaction.workspaceId,
        accountId: updatedTransaction.accountId,
        categoryId: updatedTransaction.categoryId,
        description: updatedTransaction.description,
        amount: updatedTransaction.amount,
        date: updatedTransaction.date,
        type: updatedTransaction.type as TransactionType,
        status: updatedTransaction.status as TransactionStatus,
        recurringId: updatedTransaction.recurringId,
        createdAt: updatedTransaction.createdAt,
        updatedAt: updatedTransaction.updatedAt,
      },
      updatedTransaction.id,
    );

    return right({ transaction });
  }

  private calculateBalanceEffect(
    amount: bigint,
    type: TransactionType,
  ): number {
    const amountNum = Number(amount);
    return type === TransactionType.INCOME ? amountNum : -amountNum;
  }
}
