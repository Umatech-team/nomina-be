import { TransactionStatus, TransactionType } from '@constants/enums';
import { PrismaService } from '@infra/databases/prisma/prisma.service';
import { AccountRepository } from '@modules/account/repositories/contracts/AccountRepository';
import { CategoryRepository } from '@modules/category/repositories/contracts/CategoryRepository';
import { Injectable } from '@nestjs/common';
import { TokenPayloadSchema } from '@providers/auth/strategys/jwtStrategy';
import { Service } from '@shared/core/contracts/Service';
import { Either, left, right } from '@shared/core/errors/Either';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError';
import { CreateTransactionDTO } from '../dto/CreateTransactionDTO';
import { Transaction } from '../entities/Transaction';
import { InvalidAmountError } from '../errors/InvalidAmountError';

type Request = CreateTransactionDTO & TokenPayloadSchema;
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
    private readonly prisma: PrismaService,
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
    // Validate amount
    if (amount <= 0) {
      return left(new InvalidAmountError());
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

    // Create transaction atomically with balance update
    const result = await this.prisma.$transaction(async (tx) => {
      // Create transaction
      const transactionData = await tx.transaction.create({
        data: {
          workspaceId,
          accountId,
          categoryId,
          description,
          amount: BigInt(amount),
          date,
          type,
          status,
          recurringId: null,
        },
      });

      // Update account balance ONLY if status is COMPLETED
      if (status === TransactionStatus.COMPLETED) {
        const balanceDelta =
          type === TransactionType.INCOME ? Number(amount) : -Number(amount);

        await tx.account.update({
          where: { id: accountId },
          data: { balance: { increment: balanceDelta } },
        });
      }

      return transactionData;
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
}
