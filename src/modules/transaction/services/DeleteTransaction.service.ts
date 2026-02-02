import { TransactionStatus, TransactionType } from '@constants/enums';
import { PrismaService } from '@infra/databases/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { FindTransactionDTO } from '../dto/FindTransactionDTO';
import { Transaction } from '../entities/Transaction';
import { TransactionNotFoundError } from '../errors/TransactionNotFoundError';

type Request = FindTransactionDTO & TokenPayloadSchema;
type Errors = UnauthorizedError | TransactionNotFoundError;
type Response = {
  transaction: Transaction;
};

@Injectable()
export class DeleteTransactionService
  implements Service<Request, Errors, Response>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    workspaceId,
    transactionId,
  }: Request): Promise<Either<Errors, Response>> {
    // Fetch transaction to validate ownership
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return left(new TransactionNotFoundError());
    }

    if (transaction.workspaceId !== workspaceId) {
      return left(new UnauthorizedError());
    }

    // Map to entity before deletion
    const transactionEntity = new Transaction(
      {
        workspaceId: transaction.workspaceId,
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        type: transaction.type as TransactionType,
        status: transaction.status as TransactionStatus,
        recurringId: transaction.recurringId,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      },
      transaction.id,
    );

    // Delete transaction atomically with balance reversion
    await this.prisma.$transaction(async (tx) => {
      // Delete transaction
      await tx.transaction.delete({
        where: { id: transactionId },
      });

      // Revert balance if status was COMPLETED
      if (transaction.status === TransactionStatus.COMPLETED) {
        const balanceDelta =
          transaction.type === TransactionType.INCOME
            ? -Number(transaction.amount)
            : Number(transaction.amount);

        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceDelta } },
        });
      }
    });

    return right({
      transaction: transactionEntity,
    });
  }
}
