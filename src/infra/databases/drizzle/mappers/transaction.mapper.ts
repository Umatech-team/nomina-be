import { TransactionStatus, TransactionType } from '@constants/enums';
import * as schema from '@infra/databases/drizzle/schema';
import { Transaction } from '@modules/transaction/entities/Transaction';

type TransactionDrizzle = typeof schema.transactions.$inferSelect;
type TransactionDrizzleInsert = typeof schema.transactions.$inferInsert;

export class TransactionMapper {
  static toDomain(raw: TransactionDrizzle): Transaction {
    return new Transaction(
      {
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        accountId: raw.accountId,
        destinationAccountId: raw.destinationAccountId ?? null,
        amount: BigInt(raw.amount),
        categoryId: raw.categoryId,
        date: raw.date,
        title: raw.title,
        description: raw.description,
        recurringId: raw.recurringId,
        status: raw.status as TransactionStatus,
        type: raw.type as TransactionType,
        workspaceId: raw.workspaceId,
      },
      raw.id,
    );
  }

  static toDatabase(entity: Transaction): TransactionDrizzleInsert {
    return {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt as Date,
      accountId: entity.accountId,
      destinationAccountId: entity.destinationAccountId,
      amount: Number(entity.amount),
      categoryId: entity.categoryId,
      date: entity.date,
      title: entity.title,
      description: entity.description,
      recurringId: entity.recurringId,
      status: entity.status,
      type: entity.type,
      workspaceId: entity.workspaceId,
    };
  }
}
