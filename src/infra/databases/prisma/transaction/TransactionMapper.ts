import { TransactionStatus, TransactionType } from '@constants/enums';
import { Transaction } from '@modules/transaction/entities/Transaction';
import { Prisma, Transaction as TransactionPrisma } from '@prisma/client';

export class TransactionMapper {
  static toEntity(raw: TransactionPrisma): Transaction {
    return new Transaction(
      {
        workspaceId: raw.workspaceId,
        accountId: raw.accountId,
        categoryId: raw.categoryId,
        description: raw.description,
        amount: raw.amount,
        date: raw.date,
        type: raw.type as TransactionType,
        status: raw.status as TransactionStatus,
        recurringId: raw.recurringId,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }

  static toPrisma(entity: Transaction): Prisma.TransactionUncheckedCreateInput {
    return {
      id: entity.id,
      workspaceId: entity.workspaceId,
      accountId: entity.accountId,
      categoryId: entity.categoryId,
      description: entity.description,
      amount: entity.amount,
      date: entity.date,
      type: entity.type,
      status: entity.status,
      recurringId: entity.recurringId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt ?? new Date(),
    };
  }
}
